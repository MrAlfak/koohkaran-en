import { img } from "./utils";
import { useState, useEffect, useRef } from "react";
import ContactPage from "./ContactPage";
import AboutPage from "./AboutPage";
import JournalPage from "./JournalPage";
import ArticlePage from "./ArticlePage";
import ProductsPage from "./ProductsPage";
import ProductDetailPage from "./ProductDetailPage";
import EventsPage from "./EventsPage";
import EventDetailPage from "./EventDetailPage";
import SocialFab from "./components/SocialFab";
import { BackgroundMusicProvider } from "./components/BackgroundMusicProvider";
import NavHeaderActions from "./components/NavHeaderActions";
import { updatePageSeo, SITE_NAME } from "./seo";
import { getProduct, PRODUCTS as ALL_PRODUCTS, PRODUCT_CATEGORIES } from "./products";
import { getEvent } from "./events";

/* ─── fade-in hook ─── */
function useFade(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, v };
}
/* ─── icon wipe-draw ─── */
function WipeDraw({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.clipPath = "inset(0 100% 0 0)";
    let timer: ReturnType<typeof setTimeout>;
    const o = new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) {
        timer = setTimeout(() => {
          el.style.transition = `clip-path 1.4s cubic-bezier(.4,0,.2,1)`;
          el.style.clipPath = "inset(0 0% 0 0)";
        }, delay);
      } else {
        el.style.transition = "none";
        el.style.clipPath = "inset(0 100% 0 0)";
      }
    }, { threshold: 0 });
    o.observe(el);
    return () => { o.disconnect(); clearTimeout(timer); };
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}

/* ─── FAQ sketch: CSS stroke-draw, erase on mouse leave, redraw on scroll back ─── */
function useSketchHoverDraw(duration = 2800, stagger = 90) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const section = el.closest("section");
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = Array.from(el.querySelectorAll("path"));
    const count = paths.length;
    let ready = false;
    let sectionVisible = false;
    let dismissed = false;
    let wasSectionVisible = false;
    let scrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;
    let ioTimer: ReturnType<typeof setTimeout>;

    el.style.setProperty("--sketch-duration", `${duration}ms`);

    paths.forEach((p, i) => {
      const len = p.getTotalLength() || 0;
      if (len <= 0) return;
      p.style.setProperty("--sketch-len", `${len}`);
      p.style.setProperty("--sketch-delay-in", `${i * stagger}ms`);
      p.style.setProperty("--sketch-delay-out", `${(count - 1 - i) * stagger}ms`);
      p.style.strokeDasharray = `${len}`;
      p.style.transition = "none";
      p.style.strokeDashoffset = reduce ? "0" : `${len}`;
    });

    el.dataset.sketch = reduce ? "in" : "out";

    const apply = () => {
      if (!ready || scrolling) return;
      el.dataset.sketch = sectionVisible && !dismissed ? "in" : "out";
    };

    const onWindowScroll = () => {
      scrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        scrolling = false;
        apply();
      }, 140);
    };

    const enableTransitions = () => {
      paths.forEach(p => {
        if (!p.style.getPropertyValue("--sketch-len")) return;
        p.style.transition = "";
        p.style.strokeDashoffset = "";
      });
      ready = true;
      apply();
    };

    const onMouseEnter = () => {
      if (scrolling) return;
      dismissed = false;
      apply();
    };
    const onMouseLeave = () => {
      if (scrolling) return;
      dismissed = true;
      apply();
    };

    const io = new IntersectionObserver(([e]) => {
      clearTimeout(ioTimer);
      ioTimer = setTimeout(() => {
        sectionVisible = e.isIntersecting;
        if (sectionVisible && !wasSectionVisible) dismissed = false;
        wasSectionVisible = sectionVisible;
        apply();
      }, 80);
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });

    io.observe(section);
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    requestAnimationFrame(() => requestAnimationFrame(enableTransitions));

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(ioTimer);
      io.disconnect();
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, [duration, stagger]);

  return ref;
}

function Fade({ children, d = 0, style = {} }: { children: React.ReactNode; d?: number; style?: React.CSSProperties }) {
  const { ref, v } = useFade();
  return (
    <div ref={ref} className="scroll-fade" style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(24px)",
      transition: `opacity .9s cubic-bezier(0.16,1,0.3,1) ${d}s, transform .9s cubic-bezier(0.16,1,0.3,1) ${d}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── smooth crossfade background slider (CTA section) ─── */
const CTA_SLIDER_IMAGES = [
  "images/koohkran-slider.webp",
  "images/koohkran-slider2.webp",
  "images/koohkran-slider3.webp",
  "images/koohkran-slider4.webp",
  "images/koohkran-slider5.webp",
];

function CtaSlider({ images, interval = 5500 }: { images: string[]; interval?: number }) {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const startAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (reduceMotion.current) return;
    timerRef.current = setInterval(() => setActive(i => (i + 1) % images.length), interval);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length, interval]);

  const goTo = (i: number) => {
    setActive(((i % images.length) + images.length) % images.length);
    startAutoplay();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const endDrag = (e: React.PointerEvent) => {
    setDragging(false);
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    const THRESHOLD = 40;
    if (delta < -THRESHOLD) goTo(active + 1);
    else if (delta > THRESHOLD) goTo(active - 1);
  };

  return (
    <>
      <div
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ position: "absolute", inset: 0, cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y" }}
      >
        {images.map((src, i) => (
          <img key={src} src={img(src)} alt="" loading="lazy" decoding="async" draggable={false} style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 55%",
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.8s ease",
            willChange: "opacity",
            pointerEvents: "none",
          }} />
        ))}
      </div>
      <div style={{
        position: "absolute", left: "50%", bottom: "clamp(18px,2.4vw,28px)", transform: "translateX(-50%)",
        display: "flex", gap: 10, zIndex: 2,
      }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} style={{
            width: 7, height: 7, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
            background: "#fff",
            opacity: i === active ? 0.9 : 0.38,
            transform: i === active ? "scale(1.35)" : "scale(1)",
            transition: "opacity .4s ease, transform .4s ease",
          }} />
        ))}
      </div>
    </>
  );
}

/* ─── data ─── */
// hand-picked cover product per category — some catalog entries still point at
// placeholder image paths that were never uploaded, so we can't just take items[0]
const CATEGORY_COVER_PRODUCT_ID: Partial<Record<string, number>> = {
  Granite: 3,   // Native Black Super Rock
  Marble: 1,    // Persian Bianco
  Travertine: 12, // Red Travertine
  Quartzite: 5, // Black Horse Rock
  "Semi Precious": 18, // Royal Black Wood
};
// fallback cover photo for categories with no product (or no working photo) yet
const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  Onyx: "images/onyx.webp",
  Limestone: "images/limestone.webp",
  Basalt: "images/basalt.webp",
};

const COLLECTIONS = PRODUCT_CATEGORIES.map(cat => {
  const items = ALL_PRODUCTS.filter(p => p.cat === cat);
  const coverId = CATEGORY_COVER_PRODUCT_ID[cat];
  const cover = items.find(p => p.id === coverId);
  return {
    name: cat as string,
    count: items.length,
    img: cover?.image ?? CATEGORY_FALLBACK_IMG[cat] ?? items[0]?.image ?? "images/granite.jpg",
  };
});

const SELECTED_PRODUCT_IDS = [16, 36, 46, 35, 29, 43, 18, 12];
const SELECTED_PRODUCTS = SELECTED_PRODUCT_IDS
  .map(id => ALL_PRODUCTS.find(p => p.id === id))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

// one representative photo per stone category, reusing the already-verified collection covers
const OUR_STONES_IMAGES = COLLECTIONS.map(c => c.img);

/* ─── "Our Stones" — pinned section whose center image slides through on scroll ─── */
function OurStonesSlider({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      setActive(Math.min(images.length - 1, Math.floor(progress * images.length)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [images.length]);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section ref={trackRef} style={{ position: "relative", height: `${images.length * 60}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div className="our-stones-row max-w-site" style={{ margin: "0 auto", width: "100%", padding: "0 clamp(24px,5vw,64px)" }}>
          <h2 className="our-stones-word our-stones-word--first">Our</h2>
          <div className="our-stones-media">
            {images.map((src, i) => (
              <img key={src} src={img(src)} alt="" loading="lazy" decoding="async" style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                transform: `translateX(${(i - active) * 100}%)`,
                transition: reduceMotion ? "none" : "transform 1s cubic-bezier(0.65,0,0.35,1)",
              }} />
            ))}
          </div>
          <h2 className="our-stones-word our-stones-word--last">Stones</h2>
        </div>
      </div>
    </section>
  );
}

const STONE_SPIRAL_IMAGES = [
  "images/about_page_img_4.jpg",
  "images/stones/black-forest.webp",
  "images/about_page_img_2.jpg",
  "images/stones/alpinus-rock.webp",
  "images/about_stone.jpg",
];

const STONE_SPIRAL_EYEBROW = "NATURAL STONE";
const STONE_SPIRAL_TITLE = "Beauty Carved by Nature";
const STONE_SPIRAL_DESC = "Discover premium marble, granite, onyx, travertine, and quartzite—carefully sourced and selected to elevate architecture with lasting beauty.";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// each image flies in from a different edge of the screen (top / right / bottom / left / top-left)
const STONE_SPIRAL_DIRS = [
  { dx:  0,    dy: -1,    rot: -260, settleRot:  3 },
  { dx:  1,    dy:  0,    rot:  220, settleRot: -4 },
  { dx:  0,    dy:  1,    rot: -230, settleRot:  2 },
  { dx: -1,    dy:  0,    rot:  250, settleRot: -3 },
  { dx: -0.55, dy: -0.75, rot: -210, settleRot:  4 },
];

/* ─── pinned section: photos fly in from off-screen, spin, and converge into a stack, then release to the next section ─── */
function StoneSpiral({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [stageSize, setStageSize] = useState(420);

  useEffect(() => {
    const measure = () => { if (stageRef.current) setStageSize(stageRef.current.offsetWidth); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // smoothly lerp toward the scroll-derived target every frame, instead of snapping
  // straight to it — this is what makes the spin feel fluid even on a choppy wheel/trackpad
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let current = 0;

    const target = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      return scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    };

    const tick = () => {
      const t = target();
      current += (t - current) * (reduce ? 1 : 0.065);
      if (Math.abs(t - current) < 0.0006) current = t;
      setProgress(current);
      if (running) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
        setProgress(target());
      }
    }, { rootMargin: "50% 0px 50% 0px" });
    io.observe(el);

    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const reach = stageSize / 2 + 80;
  const textOpacity = reduceMotion ? 0 : Math.max(0, 1 - progress / 0.4);

  return (
    <section ref={trackRef} style={{ position: "relative", height: "280vh", background: "#fff" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div className="stone-spiral__text" style={{ opacity: textOpacity }}>
          <p className="stone-spiral__eyebrow">{STONE_SPIRAL_EYEBROW}</p>
          <h2 className="stone-spiral__title">{STONE_SPIRAL_TITLE}</h2>
          <p className="stone-spiral__desc">{STONE_SPIRAL_DESC}</p>
        </div>
        <div ref={stageRef} className="stone-spiral">
          {images.map((src, i) => {
            const dir = STONE_SPIRAL_DIRS[i % STONE_SPIRAL_DIRS.length];
            const local = Math.min(1, Math.max(0, (progress - i * 0.05) / (1 - i * 0.05)));
            const e = reduceMotion ? 1 : easeOutCubic(local);
            const startX = dir.dx * (vw * 0.65 + reach);
            const startY = dir.dy * (vh * 0.65 + reach);
            const x = reduceMotion ? 0 : startX * (1 - e);
            const y = reduceMotion ? 0 : startY * (1 - e);
            const rot = reduceMotion ? dir.settleRot : dir.rot + (dir.settleRot - dir.rot) * e;
            return (
              <div key={src} className="stone-spiral__wrap" style={{
                transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`,
                opacity: Math.min(1, 0.15 + e * 1.3),
                zIndex: i + 1,
              }}>
                <img src={img(src)} alt="" loading="lazy" decoding="async" className="stone-spiral__img" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { val: "10+",  label: "Years of Crafted Experience" },
  { val: "200+", label: "Residential Projects" },
  { val: "100+", label: "Commercial Spaces Transformed" },
  { val: "400+", label: "Serving Clients Nationalwide" },
];

const FAQS = [
  { title: "What types of natural stone do you supply?", body: "We offer premium slabs in granite, marble, onyx, travertine, quartzite, and semi-precious stone — each curated for architectural and interior applications." },
  { title: "How do I choose the right slab for my project?", body: "Our specialists help you match vein pattern, finish, thickness, and durability to your space, lighting, and budget. Book a free consultation to review options in person or virtually." },
  { title: "Do you deliver nationwide and internationally?", body: "Yes. We coordinate secure crating, logistics, and white-glove handling to deliver slabs in perfect condition across the region and for international projects." },
  { title: "Can I visit your showroom before ordering?", body: "Absolutely. You are welcome to view full slabs in our showroom, compare finishes side by side, and reserve material for your project timeline." },
  { title: "What is the typical lead time?", body: "Lead time depends on stone availability and destination. In-stock slabs can often ship within days; custom sourcing typically takes 2–6 weeks. We confirm timelines before you commit." },
  { title: "Do you work with architects and contractors?", body: "Yes. We partner with design studios, architects, and contractors on residential and commercial projects — from material specification through delivery coordination." },
];

/* ─── SVG logo (exact from SVG file) ─── */
function KLogo({ size = 44 }: { size?: number }) {
  return <img src={img("images/logo.png")} alt="Koohkaran" style={{ width: size, height: size }} />;
}

/* ─── Feature icons ─── */
const FEATURES = [
  {
    title: "Indoor Spaces",
    desc:  "Transforming interior surfaces, luxury flooring, and premium wall claddings for sophisticated modern living.",
    icon: (
      <svg width="172" height="32" viewBox="0 0 172 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#ci1)">
          <path d="M128 25H155V31H128V25ZM121 31V25H124V31H121ZM16 29H50V32H16V29ZM51 25.5H85V26.5H51V25.5ZM51 8H72V23H51V8ZM138 8H155V23H138V8ZM103 23V8H120V23H103ZM86 8H103V23H86V8ZM85 8V23H72V8H85ZM85 32H51V29H85V32ZM86 28.29H94.79V26.16H86V25H120V31H86V28.29ZM121 23V8H138V23H121ZM165 23H156V8H165V23ZM127.85 32H172V31.43H156.14V25.49H165.12V5.37H139.32V3.83H127.85V0H124.6V3.83H113.14V5.37H41.09V5.94H41.47V8.04H50.27V23.38H41.47V25.48H50.27V26.44H6.3V28.55H15.09V31.23H0V31.81H124.41" fill="black"/>
        </g>
        <defs><clipPath id="ci1"><rect width="172" height="32" fill="white"/></clipPath></defs>
      </svg>
    ),
  },
  {
    title: "Outdoor Designs",
    desc:  "Bringing natural strength and elegance to high-end facades, luxury courtyards, and open-air architectural features.",
    icon: (
      <svg width="90" height="33" viewBox="0 0 90 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#ci2)">
          <path d="M28.96 0.24C29.06 0.44 28.9601 0.84 28.76 0.94L20 5.99V32.49C20 32.8 19.8 33.01 19.5 33.01C19.2001 33.01 19 32.81 19 32.5V6.56L14 9.43V32.5C14 32.8 13.8 33 13.5 33C13.2 33 13 32.8 13 32.5V10L8.00005 12.88V32.48C8.00005 32.79 7.80005 33 7.50005 33C7.20005 33 7.00005 32.8 7.00005 32.49V13.45L0.830049 17H0.530049C0.330049 17 0.130049 16.9 0.0300495 16.7C-0.0599506 16.5 0.0300495 16.1 0.230049 15.99L19.0401 5.29C19.1201 5.11 19.2801 5 19.5 5H19.55L28.2701 0.04C28.4701 -0.06 28.87 0.04 28.97 0.24H28.96ZM60 0V9.62L89.66 18.98C89.9601 19.08 90.06 19.38 89.96 19.59C89.96 19.79 89.76 20 89.56 20H89.36L29.34 0.95C29.0401 0.85 28.9401 0.55 29.0401 0.35C29.1401 0.04 29.44 -0.06 29.64 0.04L57 8.67V0L60 0Z" fill="black"/>
        </g>
        <defs><clipPath id="ci2"><rect width="90" height="33" fill="white"/></clipPath></defs>
      </svg>
    ),
  },
  {
    title: "Custom Features",
    desc:  "Crafting bespoke elements, from luxury kitchen countertops and islands to majestic monolithic fireplaces.",
    icon: (
      <svg width="85" height="32" viewBox="0 0 85 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#ci3)">
          <path d="M79.82 17.54C79.82 17.54 79.87 17.54 79.9 17.52L84.54 16.14C84.54 16.14 84.61 16.12 84.64 16.09H84.97V14.12H32.37V4.26L29.3 0.05V0.02H29.29L29.27 0V0.03L1.09997 10.95L0.969971 11V30.78H4.97997V32H59.56V30.28H84.96V28.46H66.46V17.54H79.82ZM83.97 29.95H59.07V29.89L51.67 29.95H28.97V29.05H83.97V29.95ZM0.969971 11.75L28.97 1V30.98L26.63 31H0.969971V11.75ZM31.97 29V18H36.97V29H31.97ZM37.97 29V18H44.97V29H37.97ZM44.97 29V18H51.97V29H44.97ZM83.97 15.97V16H28.97V15H83.97V15.97ZM51.97 29V18H58.97V29H51.97ZM65.97 29H58.97V18H65.97V29Z" fill="black"/>
        </g>
        <defs><clipPath id="ci3"><rect width="85" height="32" fill="white"/></clipPath></defs>
      </svg>
    ),
  },
];

/* ─── Arrow link ─── */
function ArrowLink({ children, href = "#", light = false, onClick }: { children: React.ReactNode; href?: string; light?: boolean; onClick?: () => void }) {
  const c = light ? "#fff" : "#1c1917";
  return (
    <a href={href} onClick={e => { if (onClick) { e.preventDefault(); onClick(); } }}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, color: c, textDecoration: "none", fontSize: 13, borderBottom: `1px solid ${light ? "rgba(255,255,255,0.6)" : "#1c1917"}`, paddingBottom: 2 }}>
      {children}
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke={c} strokeWidth="1.3">
        <line x1="0" y1="5" x2="16" y2="5"/><polyline points="11,1 16,5 11,9"/>
      </svg>
    </a>
  );
}

/* ════════════════ ROUTER ════════════════ */
type Page = "home" | "contact" | "about" | "journal" | "article" | "products" | "product" | "events" | "event";

/* URL <-> page mapping, so the address bar reflects navigation */
function pathFor(page: Page, id?: number): string {
  if (page === "product") return `/products/${id ?? 0}`;
  if (page === "event") return `/events/${id ?? 0}`;
  const PATHS: Record<Exclude<Page, "product" | "event">, string> = {
    home: "/",
    contact: "/contact",
    about: "/about",
    journal: "/journal",
    article: "/journal/article",
    products: "/products",
    events: "/events",
  };
  return PATHS[page];
}

function parseLocation(pathname: string): { page: Page; id: number } {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return { page: "home", id: 0 };
  if (segs[0] === "contact") return { page: "contact", id: 0 };
  if (segs[0] === "about") return { page: "about", id: 0 };
  if (segs[0] === "journal") return { page: segs[1] === "article" ? "article" : "journal", id: 0 };
  if (segs[0] === "products") return segs[1] ? { page: "product", id: Number(segs[1]) || 0 } : { page: "products", id: 0 };
  if (segs[0] === "events") return segs[1] ? { page: "event", id: Number(segs[1]) || 0 } : { page: "events", id: 0 };
  return { page: "home", id: 0 };
}

function PageTransition() {
  const initial = parseLocation(window.location.pathname);
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(initial.page);
  const [productId, setProductId] = useState(initial.page === "product" ? initial.id : 0);
  const [eventId, setEventId] = useState(initial.page === "event" ? initial.id : 0);
  const [productCategory, setProductCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const { page, id } = parseLocation(window.location.pathname);
      if (page === "product") setProductId(id);
      if (page === "event") setEventId(id);
      setVisible(false);
      setTimeout(() => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
        requestAnimationFrame(() => setVisible(true));
      }, 520);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => document.documentElement.classList.remove("is-scrolling"), 140);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, []);

  useEffect(() => {
    if (currentPage === "product") {
      const p = getProduct(productId);
      updatePageSeo("product", {
        title: `${p.name} | ${p.cat} | ${SITE_NAME}`,
        description: `${p.name} — ${p.cat} natural stone slab (${p.size}). Finish: ${p.finish}. Origin: ${p.origin}. Product code: ${p.code}.`,
      });
      return;
    }
    if (currentPage === "event") {
      const e = getEvent(eventId);
      updatePageSeo("event", {
        title: `${e.title} | Events | ${SITE_NAME}`,
        description: `${e.excerpt} ${e.date} · ${e.location}`,
      });
      return;
    }
    updatePageSeo(currentPage);
  }, [currentPage, productId, eventId]);

  const navigate = (p: Page, id?: number, category?: string) => {
    if (id !== undefined) {
      if (p === "product") setProductId(id);
      if (p === "event") setEventId(id);
    }
    if (p === "products") setProductCategory(category);
    if (p === currentPage && id === undefined && category === undefined) return;
    const navId = id !== undefined ? id : p === "product" ? productId : p === "event" ? eventId : undefined;
    const url = pathFor(p, navId);
    if (window.location.pathname !== url) window.history.pushState({}, "", url);
    setVisible(false);
    setTimeout(() => {
      setCurrentPage(p);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => setVisible(true));
    }, 520);
  };

  return (
    <BackgroundMusicProvider>
      <div style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1)",
        minHeight: "100vh",
      }}>
        {currentPage === "home"    && <HomePage    onNavigate={navigate} />}
        {currentPage === "contact" && <ContactPage onNavigate={navigate} />}
        {currentPage === "about"   && <AboutPage   onNavigate={navigate} />}
        {currentPage === "journal" && <JournalPage onNavigate={navigate} />}
        {currentPage === "article" && <ArticlePage onNavigate={navigate} />}
        {currentPage === "products" && <ProductsPage onNavigate={navigate} initialCategory={productCategory} />}
        {currentPage === "product" && <ProductDetailPage onNavigate={navigate} productId={productId} />}
        {currentPage === "events" && <EventsPage onNavigate={navigate} />}
        {currentPage === "event" && <EventDetailPage onNavigate={navigate} eventId={eventId} />}
      </div>
      <SocialFab />
    </BackgroundMusicProvider>
  );
}

export default function App() {
  return <PageTransition />;
}

/* ════════════════ HOME PAGE ════════════════ */
// ── پیکربندی parallax هر لایه ──
// idx: 0=mt3(پس‌زمینه)  1=text  2=mt1(جلو)  3=mt2(جلو)
// x مثبت → راست، x منفی → چپ
const PLX_CFG = [
  { y: +0.60, x:  0    },  // 0  کوه ۳ – پس‌زمینه، بالا می‌ره آروم
  { y: -0.40, x:  0    },  // 1  متن – کمی پایین می‌ره
  { y: -0.00, x: +0.00 },  // 2  کوه ۱ – بالا می‌ره + به راست
  { y: +0.30, x: -0.07 },  // 3  کوه ۲ – بالا می‌ره + به چپ
];

function HomePage({ onNavigate }: { onNavigate: (p: Page, id?: number, category?: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const sketchRef = useSketchHoverDraw();

  // Parallax refs برای 4 لایه (0=mt3, 1=text, 2=mt1, 3=mt2)
  const plxRefs = useRef<(HTMLDivElement | null)[]>(Array(4).fill(null));

  useEffect(() => {
    let raf = 0;
    const fn = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 80);
      });
    };
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => {
      window.removeEventListener("scroll", fn);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── parallax: only on scroll, not every frame ──
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lastY = -1;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (y === lastY) return;
      lastY = y;
      const vh = window.innerHeight;
      if (y > vh * 1.5) return;
      const mountainScale = 1 + (y / vh) * 0.1;
      plxRefs.current.forEach((el, i) => {
        if (!el) return;
        const { x, y: ys } = PLX_CFG[i];
        const sc = i !== 1 ? mountainScale : 1;
        el.style.transform = `translate3d(${y * x}px,${y * ys}px,0) scale(${sc})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Urbanist', 'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#1c1917", overflowX: "clip", overflowY: "visible" }}>

      {/* ══════════ MOBILE MENU OVERLAY ══════════ */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
          <span /><span />
        </button>
        {(["Home","About","Products","Events","Journal"] as const).map(n => (
          <button key={n} className="mobile-menu-link" onClick={() => {
            setMenuOpen(false);
            if (n === "About") onNavigate("about");
            else if (n === "Journal") onNavigate("journal");
            else if (n === "Products") onNavigate("products");
            else if (n === "Events") onNavigate("events");
            else if (n === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
          }}>{n}</button>
        ))}
        <button className="mobile-menu-contact" onClick={() => { setMenuOpen(false); onNavigate("contact"); }}>
          Contact Us
        </button>
      </div>

      {/* ══════════ NAV ══════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "clamp(12px,2vw,20px) clamp(24px,5vw,64px)",
        background: scrolled || menuOpen ? "rgba(255,255,255,0.35)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(16px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled || menuOpen ? "blur(16px) saturate(180%)" : "none",
        borderBottom: scrolled || menuOpen ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
        transition: "background .35s ease, box-shadow .35s ease, border-color .35s ease",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
      }}>
        <button onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: 201 }}>
          <KLogo size={42} />
        </button>
        <nav className="site-nav" style={{ gap: "clamp(20px,3vw,44px)" }}>
          {(["Home","About","Products","Events","Journal"] as const).map((n, i) => (
            <button key={n}
              onClick={() => n === "About" ? onNavigate("about") : n === "Journal" ? onNavigate("journal") : n === "Products" ? onNavigate("products") : n === "Events" ? onNavigate("events") : n === "Home" ? window.scrollTo({top:0,behavior:"smooth"}) : undefined}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: 14, color: scrolled ? "#292524" : "rgba(255,255,255,0.92)",
                textDecoration: i === 0 ? "underline" : "none", textUnderlineOffset: 5,
                letterSpacing: "0.01em", transition: "color .3s", fontFamily: "inherit",
              }}>{n}</button>
          ))}
        </nav>
        <NavHeaderActions onContact={() => onNavigate("contact")} tone="hero" scrolled={scrolled || menuOpen} />
        {/* Hamburger */}
        <button className={`menu-btn${menuOpen ? " open" : ""}`}
          aria-label="menu" aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
          style={{ color: scrolled || menuOpen ? "#1c1917" : "#fff" }}>
          <span /><span /><span />
        </button>
      </header>

      {/* ══════════ HERO — PARALLAX ══════════ */}
      <section style={{ position: "relative", height: "100svh", minHeight: 560, overflow: "hidden" }}>

        {/* آسمان پشت کوه‌ها */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "linear-gradient(180deg, #d6dfe6 0%, #c2cdd6 40%, #aebcc7 100%)"
        }} />

        {/* گرادیان */}
        <div className="hero-veil" style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(180deg,rgba(0,0,0,0.04) 0%,rgba(0,0,0,0.10) 45%,rgba(0,0,0,0.55) 100%)"
        }} />

        {/* 0 — کوه ۳ پس‌زمینه (کامل، بدون برش) */}
        <div ref={el => { plxRefs.current[0] = el; }} className="hero-plx" style={{ zIndex: 2 }}>
          <img src={img("images/hero/hero-koohkaran3.webp")} alt="" className="hero-mountain-img" />
        </div>

        {/* 1 — متن (جلوتر از همه کوه‌ها) */}
        <div ref={el => { plxRefs.current[1] = el; }} className="hero-plx"
          style={{ zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{
            margin: 0, color: "#fff", fontWeight: 600,
            fontSize: "clamp(40px,7.5vw,108px)",
            letterSpacing: "clamp(0.1em,2vw,0.32em)",
            textTransform: "uppercase", whiteSpace: "nowrap",
            textShadow: "0 4px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(0,0,0,0.2)",
          }}>
            {"KOOHKARAN".split("").map((ch, i) => (
              <span key={i} className="hero-letter" style={{ animationDelay: `${0.35 + i * 0.08}s` }}>{ch}</span>
            ))}
          </h1>
        </div>

        {/* 2 — کوه ۱ جلو (کامل، دریفت به راست) */}
        <div ref={el => { plxRefs.current[2] = el; }} className="hero-plx" style={{ zIndex: 5 }}>
          <img src={img("images/hero/hero koohkaran1.webp")} alt="" className="hero-mountain-img" />
        </div>

        {/* 3 — کوه ۲ جلو (کامل، دریفت به چپ) — پشت کوه ۱ */}
        <div ref={el => { plxRefs.current[3] = el; }} className="hero-plx" style={{ zIndex: 4 }}>
          <img src={img("images/hero/hero-koohkaran2.webp")} alt="" className="hero-mountain-img" />
        </div>

        {/* shimmer */}
        <div className="hero-shimmer" style={{ zIndex: 6 }} />

        {/* گرادیان سفید پایین — کوه‌ها رو مثل مه محو می‌کنه و بی‌درز به بخش بعد وصل می‌شه */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "36%", zIndex: 8, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 15%, rgba(255,255,255,0) 100%)"
        }} />

        {/* Crafted by Nature */}
        <div className="hero-tagline" style={{
          position: "absolute", bottom: 32, right: "clamp(20px,4vw,60px)",
          zIndex: 10, display: "flex", alignItems: "center", gap: 8,
          color: "rgba(255,255,255,0.88)", fontSize: 13,
        }}>
          Crafted by Nature
          <svg className="hero-scroll" width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="white" strokeWidth="1.2">
            <line x1="6" y1="0" x2="6" y2="15"/><polyline points="2,11 6,15 10,11"/>
          </svg>
        </div>
      </section>

      {/* ══════════ WHO WE ARE ══════════ */}
      <section style={{ padding: "clamp(60px,8vw,120px) clamp(24px,5vw,64px)" }}>
        <div className="max-w-site who-we-are-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(40px,6vw,100px)", alignItems: "center" }}>
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 28 }}>WHO WE ARE</p>
            <p style={{ fontSize: "clamp(16px,1.4vw,20px)", fontWeight: 300, lineHeight: 1.8, color: "#2a2420", marginBottom: 36, maxWidth: 520 }}>
              Since 2002, we have specialized in delivering an exclusive selection of premium slabs. We don't just supply stone; we provide the foundation for luxurious, architectural masterpieces. Experience unparalleled quality and precision with our curated collections.
            </p>
            <ArrowLink href="#" onClick={() => onNavigate("about")}>More about us</ArrowLink>
          </Fade>
          <Fade d={0.15}>
            <div style={{ overflow: "hidden" }}>
              <img src={img("images/about_stone.jpg")} alt="stone slabs" className="who-img" loading="lazy" decoding="async" style={{ width: "100%", height: "clamp(280px,35vw,460px)", objectFit: "cover", display: "block", transition: "transform .7s" }}
                onMouseOver={e => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════════ SLAB APPLICATIONS ══════════ */}
      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,100px)" }}>
        <div className="max-w-site">
          <Fade><p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 36 }}>SLAB APPLICATIONS</p></Fade>
          <div className="features-grid">
            {FEATURES.map(({ title, desc, icon }, i) => (
              <Fade key={title} d={i * 0.1}>
                <div style={{ border: "1px solid #e7e5e4", padding: "clamp(24px,3vw,40px) clamp(20px,2.5vw,32px) clamp(28px,3.5vw,44px)" }}>
                  <div style={{ height: 60, display: "flex", alignItems: "flex-end", marginBottom: 24 }}>
                    <WipeDraw delay={i * 180}>{icon}</WipeDraw>
                  </div>
                  <div style={{ borderTop: "1px solid #e7e5e4", paddingTop: 22 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 400, margin: "0 0 12px", letterSpacing: "0.01em" }}>{title}</h3>
                    <p style={{ fontSize: 13, color: "#78716c", lineHeight: 1.75, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OUR COLLECTIONS ══════════ */}
      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,100px)" }}>
        <div className="max-w-site">
          <Fade><p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 32 }}>OUR COLLECTIONS</p></Fade>
          <div className="collections-grid">
            {COLLECTIONS.map((c, i) => (
              <Fade key={c.name} d={i * 0.06}>
                <div
                  className="collection-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => onNavigate("products", undefined, c.name)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate("products", undefined, c.name); } }}
                >
                  <div className="collection-card__media">
                    <img className="collection-card__img" src={img(c.img)} alt={c.name} loading="lazy" decoding="async" />
                    <div className="collection-card__gradient" />
                    <span className="collection-card__explore">
                      Explore
                      <svg width="16" height="9" viewBox="0 0 18 10" fill="none" stroke="#fff" strokeWidth="1.3">
                        <line x1="0" y1="5" x2="16" y2="5" /><polyline points="11,1 16,5 11,9" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ paddingTop: 14 }}>
                    <p className="collection-card__name">{c.name}</p>
                    <p className="collection-card__count">{c.count} Products</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section style={{ borderTop: "1px solid #f0ede8", borderBottom: "1px solid #f0ede8", padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px)" }}>
        <div className="max-w-site stats-grid">
          {STATS.map((s, i) => (
            <Fade key={s.val} d={i * 0.08}>
              <div className={`stat-cell-${i + 1}`} style={{ borderLeft: i > 0 ? "1px solid #f0ede8" : "none", paddingLeft: i > 0 ? "clamp(16px,3vw,36px)" : 0 }}>
                <div style={{ fontSize: "clamp(36px,4vw,56px)", fontWeight: 300, lineHeight: 1, marginBottom: 10 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#a8a29e", lineHeight: 1.5 }}>{s.label}</div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══════════ STONE SPIRAL ══════════ */}
      <StoneSpiral images={STONE_SPIRAL_IMAGES} />

      {/* ══════════ SELECTED PRODUCTS ══════════ */}
      <section style={{ padding: "clamp(60px,7vw,96px) clamp(24px,5vw,64px)", background: "#fff" }}>
        <div className="max-w-site">
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 8 }}>SLAB MARKET</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
              <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 300, margin: 0 }}>Selected Products</h2>
              <ArrowLink href="#" onClick={() => onNavigate("products")}>All products</ArrowLink>
            </div>
          </Fade>
          <div className="selected-list">
            {SELECTED_PRODUCTS.map((p, i) => (
              <Fade key={p.id} d={i * 0.04}>
                <div className="selected-list__row" onClick={() => onNavigate("product", p.id)}>
                  <h3 className="selected-list__name">{p.name}</h3>
                  <p className="selected-list__size">{p.size} CM</p>
                  <p className="selected-list__colors">{p.colors}</p>
                  <span className="selected-list__arrow" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <line x1="3" y1="15" x2="15" y2="3" /><polyline points="6,3 15,3 15,12" />
                    </svg>
                  </span>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OUR STONES — scroll-linked slider ══════════ */}
      <OurStonesSlider images={OUR_STONES_IMAGES} />

      {/* ══════════ CTA — THE PERFECT FINISH ══════════ */}
      <section style={{ position: "relative", height: "clamp(420px,55vw,700px)", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
        <CtaSlider images={CTA_SLIDER_IMAGES} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(10,12,10,0.65) 100%)", pointerEvents: "none" }} />
        <div className="max-w-site cta-inner" style={{ position: "relative", zIndex: 2, width: "100%", padding: "0 clamp(24px,5vw,64px) clamp(40px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <Fade>
            <h2 style={{ color: "#fff", fontSize: "clamp(22px,3.2vw,46px)", fontWeight: 300, lineHeight: 1.3, margin: 0 }}>
              The perfect finish<br />begins at the source.
            </h2>
          </Fade>
          <Fade d={0.15}>
            <button style={{ fontSize: 13, letterSpacing: "0.06em", padding: "13px 30px", border: "1px solid rgba(255,255,255,0.8)", color: "#fff", background: "rgba(255,255,255,0.08)", cursor: "pointer", backdropFilter: "blur(4px)", whiteSpace: "nowrap" }}>
              Free Consultation
            </button>
          </Fade>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section id="faq-section" style={{ background: "#f7f7f7", padding: "clamp(60px,8vw,112px) clamp(24px,5vw,64px)" }}>
        <div className="max-w-site process-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(48px,6vw,100px)", alignItems: "start" }}>
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 20 }}>FAQ</p>
            <h2 style={{ fontSize: "clamp(24px,2.8vw,40px)", fontWeight: 300, lineHeight: 1.2, color: "#1c1917", margin: "0 0 16px" }}>Frequently asked questions</h2>
            <p style={{ fontSize: "clamp(15px,1.4vw,19px)", fontWeight: 300, lineHeight: 1.75, color: "#2a2420", marginBottom: 52, maxWidth: 460 }}>
              Answers to common questions about our stone slabs, consultation, and delivery.
            </p>
            <div>
              {FAQS.map((item, i) => (
                <div key={item.title} style={{ borderTop: "1px solid #e2e0de", ...(i === FAQS.length - 1 ? { borderBottom: "1px solid #e2e0de" } : {}) }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "20px 0", background: "none", border: "none", cursor: "pointer",
                    fontSize: 16, fontWeight: 400, color: "#1c1917", textAlign: "left",
                    fontFamily: "inherit", gap: 16,
                  }}>
                    <span>{item.title}</span>
                    <span style={{ fontSize: 24, fontWeight: 200, color: "#a8a29e", lineHeight: 1, flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  <div style={{ overflow: "hidden", maxHeight: openFaq === i ? 320 : 0, transition: "max-height .4s ease" }}>
                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#78716c", lineHeight: 1.8, paddingRight: 32 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 36 }}><ArrowLink onClick={() => onNavigate("contact")}>Still have questions?</ArrowLink></div>
          </Fade>
          <div ref={sketchRef} className="faq-sketch-wrap" style={{ background: "#f7f7f7", padding: "clamp(24px,3vw,40px)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
              <svg width="100%" viewBox="0 0 720 720" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 560 }}>
                <g clipPath="url(#clip0_98_7)">
                  <path opacity="0.5" d="M259.015 286.766L672.205 174.218" stroke="black" strokeOpacity="0.7" strokeWidth="0.231263" strokeLinecap="round"/>
                  <path d="M588.951 69.3789L675.289 223.554M676.831 400.856L414.732 647.537M676.831 390.064L414.732 601.285M46.2527 265.182L243.597 191.178M588.951 292.934L222.013 191.178M46.2527 405.482L257.473 471.777M447.109 601.285L46.2527 423.983M447.109 645.996L46.2527 442.484M431.692 266.724L675.289 317.602M457.902 268.265L46.2527 323.769M46.2527 400.856L470.236 516.488M437.859 518.03L676.831 377.73M629.036 83.2547L46.2527 292.934M257.473 337.644L46.2527 342.27M222.013 337.644L676.831 345.353M232.805 471.777L676.831 359.229" stroke="black" strokeOpacity="0.7" strokeWidth="0.400857" strokeLinecap="round"/>
                  <path opacity="0.5" d="M590.493 64.7539L676.831 218.929M676.831 396.231L414.732 642.912M676.831 386.981L414.732 598.201M46.2527 260.557L243.597 186.553M590.493 288.309L222.013 186.553M46.2527 400.857L259.015 467.152M447.109 596.66L46.2527 419.358M447.109 642.912L46.2527 439.401M433.233 262.099L676.831 312.977M459.443 263.64L46.2527 319.144M46.2527 397.773L470.236 513.405M437.859 513.405L676.831 373.105M630.578 78.6297L46.2527 288.309M259.015 333.019L46.2527 337.645M222.013 333.019L676.831 340.728M232.805 467.152L676.831 354.604" stroke="black" strokeOpacity="0.7" strokeWidth="0.231263" strokeLinecap="round"/>
                  <path opacity="0.5" d="M590.493 72.4624L676.831 226.638M676.831 403.94L414.732 650.621M676.831 394.689L414.732 605.91M46.2527 268.265L243.597 194.261M590.493 296.017L222.013 194.261M46.2527 408.565L259.015 474.861M447.109 604.368L46.2527 427.066M447.109 650.621L46.2527 447.109M433.233 269.807L676.831 320.685M459.443 271.349L46.2527 326.852M46.2527 405.482L470.236 521.113M437.859 521.113L676.831 380.814M630.578 86.3382L46.2527 296.017M259.015 340.728L46.2527 345.353M222.013 340.728L676.831 348.437M232.805 474.861L676.831 362.313" stroke="black" strokeOpacity="0.7" strokeWidth="0.231263" strokeLinecap="round"/>
                  <path d="M58.5867 260.557L64.7537 261.898V448.296L58.5867 450.193L52.4197 447.263V262.731L58.5867 260.557ZM58.5867 450.193V260.557M246.681 467.152V197.345M246.681 197.345L234.347 201.199V463.282L246.681 467.152L259.015 463.853V200.968L246.681 197.345ZM317.602 288.308L326.852 289.804V471.407L317.602 474.861L308.351 472.286V289.542L317.602 288.308ZM317.602 474.861V288.308M448.651 510.321V269.807L434.775 271.503V506.683L448.651 510.321Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.400857" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M447.109 269.807L459.443 272.336V503.183L447.109 510.321V269.807Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.400857" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M602.826 92.5054V470.236L610.535 463.406V105.472L602.826 92.5054ZM601.285 92.5054L590.492 96.5756V468.678L601.285 470.236V92.5054Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M659.872 195.803L653.705 198.116V414.732H659.872L664.497 410.631V203.574L659.872 195.803ZM659.872 414.732V195.803M403.94 163.426L413.191 168.792V437.797L403.94 442.484L394.69 440.711V166.941L403.94 163.426ZM403.94 442.484V163.426M612.077 471.777L46.2527 393.148" stroke="black" strokeOpacity="0.7" strokeWidth="0.400857" strokeLinecap="round"/>
                  <path d="M653.704 454.818L559.657 445.136V292.934M547.323 134.133L442.484 169.593M450.193 161.884V269.807M450.193 166.726L471.469 175.76L542.698 154.176M471.777 175.76V272.891M479.486 275.974V181.511L544.24 161.884" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M479.486 181.773L484.898 185.011L544.24 166.51M484.111 185.011V277.516M518.03 169.593V283.683" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M522.655 285.949V168.051L527.281 171.721V286.766" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round" strokeLinejoin="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M619.786 169.593V269.514L647.537 283.683V206.287L619.786 169.593Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M647.537 208.137H639.675L619.786 186.553M639.829 206.596V279.058M636.745 279.058V209.263L619.786 191.178" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M636.745 208.137H634.633L619.786 194.261M635.203 208.137V277.516M422.441 505.696V303.726L334.561 312.915V481.151L357.086 472.07V310.556M356.146 471.777L420.899 488.737" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M541.156 342.27V311.435M508.78 308.351V342.27M514.947 308.351V342.27M504.154 308.351V342.27M642.912 325.311V345.353M633.662 323.769V345.353M629.036 322.227V343.812M627.495 322.227V343.812M385.439 325.311L363.854 327.115V368.48H385.439V325.311ZM390.064 325.866V368.48H417.816V323.769L390.064 325.866ZM363.854 374.647H385.439V414.733L363.854 413.222V374.647ZM390.064 374.647V414.671L417.816 416.274V375.264L390.064 374.647ZM473.319 303.726V342.455L550.407 343.812V313.47L473.319 303.726ZM619.786 320.685V343.318L647.538 343.812V324.632L619.786 320.685Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M52.4197 257.473V427.19L424.923 592.034L601.285 449.684L558.979 445.305L447.001 511.308V269.715L267.356 293.843V462.141M602.827 83.2549V302.184" stroke="black" strokeOpacity="0.7" strokeWidth="1.58801" strokeLinecap="round"/>
                  <path d="M234.347 194.261V338.076H246.511V468.401L268.127 462.958L334.561 481.028" stroke="black" strokeOpacity="0.7" strokeWidth="1.58801" strokeLinecap="round"/>
                  <path d="M111.114 425.108L64.7537 431.645V340.497L110.22 339.186L111.114 425.108ZM111.114 425.108L246.681 467.152M52.4197 427.066V446.276L425.525 635.203V591.186" stroke="black" strokeOpacity="0.7" strokeWidth="1.58801" strokeLinecap="round"/>
                  <path d="M205.053 622.869C227.192 622.869 245.139 615.967 245.139 607.452C245.139 598.937 227.192 592.034 205.053 592.034C182.915 592.034 164.968 598.937 164.968 607.452C164.968 615.967 182.915 622.869 205.053 622.869Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M175.76 559.658C175.76 563.913 166.787 567.366 155.717 567.366C144.648 567.366 135.675 563.928 135.675 559.658C135.675 555.387 144.648 551.949 155.717 551.949C166.787 551.949 175.76 555.387 175.76 559.658Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M619.786 531.906C630.855 531.906 639.829 528.455 639.829 524.197C639.829 519.94 630.855 516.488 619.786 516.488C608.717 516.488 599.743 519.94 599.743 524.197C599.743 528.455 608.717 531.906 619.786 531.906Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M604.368 559.658C604.368 563.913 595.395 567.366 584.326 567.366C573.256 567.366 564.283 563.928 564.283 559.658C564.283 555.387 573.256 551.949 584.326 551.949C595.395 551.949 604.368 555.387 604.368 559.658Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M542.698 615.161C553.767 615.161 562.741 611.709 562.741 607.452C562.741 603.195 553.767 599.743 542.698 599.743C531.629 599.743 522.655 603.195 522.655 607.452C522.655 611.709 531.629 615.161 542.698 615.161Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M425.185 635.203L664.497 410.554V204.036L601.855 92.5054L393.749 167.049V238.371L233.961 193.984L52.4197 262.129M394.689 238.972V277.516M602.827 450.193V302.184" stroke="black" strokeOpacity="0.7" strokeWidth="1.58801" strokeLinecap="round"/>
                  <path d="M447.109 269.807L559.01 292.887L559.657 445.567" stroke="black" strokeOpacity="0.7" strokeWidth="1.58801" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M269.807 228.18V269.653L382.356 291.392V256.764L269.807 228.18Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M382.356 257.473L373.105 259.786L373.583 291.392M373.105 260.557L269.807 234.347M370.022 288.308V260.248L269.807 235.888" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M370.021 260.556H366.938V288.308M346.895 255.931V285.225M342.27 254.389V283.683M340.728 254.389V283.683M308.351 246.681V277.516M302.184 277.516V245.139M300.642 243.597V275.974" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M234.347 337.645L111.006 340.728" stroke="black" strokeOpacity="0.7" strokeWidth="1.58801" strokeLinecap="round"/>
                  <path d="M201.97 235.889V302.184M152.634 309.893V254.39L160.343 255.346V308.351M121.799 265.182V314.518M81.7131 320.685V279.058L87.8802 279.875V317.602M87.8802 279.058L121.799 268.266M160.343 254.39L201.97 240.514M161.884 308.351V256.656L200.428 243.597M185.011 249.764V306.809" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M188.094 305.268V248.223L189.636 249.302V304.959M161.884 255.931L163.426 256.671V306.809M164.968 257.473L185.011 251.306M189.636 248.223L200.428 245.139M89.4219 317.602V280.862L121.799 271.349M106.381 275.974V316.06" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M107.923 316.06V275.974L109.465 276.622V315.844M89.4834 280.599L90.9172 281.124V317.602M90.9635 282.141L104.839 277.516M109.465 275.974L121.799 272.891" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M58.5867 208.137V507.238M234.347 152.634V598.201M246.681 157.259V612.077M393.148 148.008V653.704M602.827 58.5867V516.488M317.602 117.173V497.987M664.497 161.884V456.36M448.651 234.347V528.822M46.2527 243.597L627.495 12.334M676.831 195.803L570.45 12.334" stroke="black" strokeOpacity="0.7" strokeWidth="0.231263" strokeLinecap="round"/>
                  <path d="M542.698 131.049V288.308M123.341 348.437H234.347V419.358L123.341 403.771V348.437Z" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M131.049 348.437V402.83L123.341 403.94M129.508 402.398L234.347 416.274M132.591 348.437V399.963L232.805 411.649M178.844 348.437V405.482M186.553 405.482V348.437M183.469 348.437V405.482" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                  <path d="M132.591 400.857H135.675V348.437" stroke="black" strokeOpacity="0.7" strokeWidth="0.786295" strokeLinecap="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_98_7">
                    <rect width="720" height="720" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
        </div>
      </section>

      {/* ══════════ LET'S BUILD TOGETHER ══════════ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <img src={img("images/dark_cta.jpg")} alt="stone texture" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(4,6,4,0.28)" }} />
        <div className="max-w-site lets-build-inner" style={{ position: "relative", zIndex: 2, padding: "clamp(72px,9vw,120px) clamp(24px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 40 }}>
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>YOUR DESIGN VISION, SEAMLESSLY EXECUTED</p>
            <h2 style={{ color: "#fff", fontSize: "clamp(28px,3.5vw,52px)", fontWeight: 300, margin: 0 }}>Let's build together</h2>
          </Fade>
          <Fade d={0.15}>
            <button onClick={() => onNavigate("contact")} style={{ fontSize: 13, letterSpacing: "0.06em", padding: "14px 36px", border: "1px solid rgba(255,255,255,0.55)", color: "#fff", background: "transparent", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
              Get in touch
            </button>
          </Fade>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <div className="max-w-site footer-grid" style={{ padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(24px,3vw,40px)" }}>
          {/* Contact */}
          <div>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 10px" }}>info@koohkaran.com</p>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 10px" }}>09173090000</p>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 32px", lineHeight: 1.6 }}>Shatti Al Qurum, Block 228<br />Muscat, Oman</p>
            <ArrowLink>Contact us</ArrowLink>
          </div>
          {/* Logo center */}
          <div className="footer-logo-col" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <KLogo size={60} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.14em", margin: "0 0 3px" }}>KOOHKARAN</p>
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#a8a29e", margin: 0 }}>SLAB MARKET</p>
            </div>
          </div>
          {/* Links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {[["Home","Services"],["About","Products"],["Contact Us","Events"],["Our Process","Journal"]].map(([a, b], i) => (
              <React.Fragment key={i}>
                <button onClick={() => a === "Home" ? onNavigate("home") : a === "Contact Us" ? onNavigate("contact") : a === "About" ? onNavigate("about") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{a}</button>
                <button onClick={() => b === "Products" ? onNavigate("products") : b === "Journal" ? onNavigate("journal") : b === "Events" ? onNavigate("events") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{b}</button>
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Bottom bar */}
        <div className="footer-bar" style={{ borderTop: "1px solid #f0ede8", padding: "clamp(14px,2vw,20px) clamp(24px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>© 2002 - 2026 koohkaran. Terms</p>
          <div style={{ display: "flex", gap: 18 }}>
            {["●","◆","◻","◯"].map((s,i) => <span key={i} style={{ fontSize: 10, color: "#d6d3d1", cursor: "pointer" }}>{s}</span>)}
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="back to top" style={{ background: "none", border: "1px solid #e7e5e4", padding: "7px 12px", cursor: "pointer", color: "#a8a29e", fontSize: 14 }}>↑</button>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
