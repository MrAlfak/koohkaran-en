import { img } from "./utils";
import NavHeaderActions from "./components/NavHeaderActions";
import { useState, useEffect, useRef } from "react";
import React from "react";

type Page = "home" | "contact" | "about" | "journal" | "products" | "events";

/* ─── fade-in on scroll ─── */
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
function Fade({ children, d = 0, style = {} }: { children: React.ReactNode; d?: number; style?: React.CSSProperties }) {
  const { ref, v } = useFade();
  return (
    <div ref={ref} className="scroll-fade" style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .8s ease ${d}s, transform .8s ease ${d}s`, ...style }}>
      {children}
    </div>
  );
}

/* ─── arrow link ─── */
function ArrowLink({ children, light = false, onClick }: { children: React.ReactNode; light?: boolean; onClick?: () => void }) {
  const c = light ? "#fff" : "#1c1917";
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: c, background: "none", border: "none", cursor: "pointer", fontSize: 13, borderBottom: `1px solid ${light ? "rgba(255,255,255,0.6)" : "#1c1917"}`, paddingBottom: 2, fontFamily: "inherit" }}>
      {children}
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke={c} strokeWidth="1.3">
        <line x1="0" y1="5" x2="16" y2="5"/><polyline points="11,1 16,5 11,9"/>
      </svg>
    </button>
  );
}

const valueIcon = (paths: React.ReactNode) => (
  <svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="#1c1917" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);
const VALUES = [
  {
    icon: valueIcon(<><path d="M1 19h32" /><path d="M9 19a8 8 0 0 1 16 0" /></>),
    title: "Timeless authenticity",
    body: "We source enduring natural stones that outlast fleeting trends and remain majestic for generations.",
  },
  {
    icon: valueIcon(<><path d="M1 19h32" /><path d="M17 4 6 19h22z" /><path d="M17 4v15" /></>),
    title: "Tailored curation",
    body: "Your architectural vision leads the way — we listen, adapt, and provide materials perfectly suited to your design language.",
  },
  {
    icon: valueIcon(<><path d="M1 19h32" /><path d="M7 19a10 10 0 0 1 20 0" /><circle cx="17" cy="9" r="1" /></>),
    title: "Client-centered approach",
    body: "Your vision leads the way — we listen, adapt, and source with your architectural lifestyle in mind.",
  },
  {
    icon: valueIcon(<><path d="M1 19h32" /><path d="M17 5 5 19h24z" /><path d="M12 19l5-14 5 14" /></>),
    title: "Masterful sourcing",
    body: "We value the heritage of the earth, partnering with the finest quarries and craftsmen to ensure unparalleled quality.",
  },
];

/* ════════════════════════════════════ */
export default function AboutPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#1c1917", overflowX: "hidden" }}>

      {/* ══ NAV ══ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "clamp(12px,2vw,20px) clamp(24px,5vw,64px)",
        background: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        transition: "background .35s ease, box-shadow .35s ease",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "0 1px 0 rgba(0,0,0,0.03)",
      }}>
        <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <img src={img("images/logo.png")} alt="Koohkaran" style={{ width: 42, height: 42 }} />
        </button>
        <nav style={{ display: "flex", gap: "clamp(20px,3vw,44px)" }}>
          {(["Home", "About", "Products", "Events", "Journal"] as const).map((n, i) => (
            <button key={n} onClick={() => n === "Home" ? onNavigate("home") : n === "Journal" ? onNavigate("journal") : n === "Products" ? onNavigate("products") : n === "Events" ? onNavigate("events") : undefined}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, letterSpacing: "0.01em", fontFamily: "inherit",
                color: "#292524",
                textDecoration: i === 1 ? "underline" : "none",
                textUnderlineOffset: 5, transition: "color .3s",
              }}>{n}</button>
          ))}
        </nav>
        <NavHeaderActions onContact={() => onNavigate("contact")} tone="default" scrolled />
      </header>

      {/* ══ HERO ══ */}
      <section className="about-hero-grid" style={{ minHeight: "100svh", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        {/* Left text */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(100px,12vw,140px) clamp(32px,5vw,80px) clamp(60px,8vw,100px)" }}>
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 28 }}>ABOUT KOOHKARAN</p>
            <h1 style={{ fontSize: "clamp(28px,3.2vw,48px)", fontWeight: 300, lineHeight: 1.25, margin: "0 0 28px", color: "#1c1917" }}>
              Elevating spaces with<br />nature's masterpieces<br />and architectural vision
            </h1>
            <p style={{ fontSize: "clamp(14px,1.1vw,16px)", fontWeight: 300, lineHeight: 1.8, color: "#57534e", maxWidth: 480, margin: "0 0 40px" }}>
              Koohkaran was founded out of a shared desire to provide materials that are as enduring as they are breathtaking — authentic, powerful, and deeply unique. With a foundation in premium stone sourcing and architectural custom, we connect visionary designs with the finest natural slabs, offering refined and purposeful elegance.
            </p>
            <ArrowLink onClick={() => onNavigate("contact")}>Get in touch</ArrowLink>
          </Fade>
        </div>

        {/* Right image — interior with stone wall */}
        <div className="about-hero-img" style={{ position: "relative", overflow: "hidden" }}>
          <img src={img("images/about_page_img_0.jpg")} alt="luxury interior" decoding="async" style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
            transition: "transform 8s ease",
          }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,0.04) 0%, transparent 30%)" }} />
        </div>
      </section>

      {/* ══ PHILOSOPHY ══ */}
      <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5vw,64px)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 32 }}>OUR PHILOSOPHY</p>
            <p style={{ fontSize: "clamp(17px,1.8vw,26px)", fontWeight: 300, lineHeight: 1.75, color: "#2a2420", margin: 0 }}>
              Every masterpiece begins with understanding the canvas. We take the time to grasp the architectural intent, the scale of the space, and the desired aesthetic. From there, we curate tailored stone selections that reflect the essence of your project — surfaces that command attention while remaining effortlessly timeless.
            </p>
          </Fade>
        </div>
      </section>

      {/* ══ OUR VALUES — grey bg ══ */}
      <section style={{ background: "#f7f7f7", padding: "clamp(60px,8vw,120px) clamp(24px,5vw,64px)" }}>
        <div className="about-values-grid" style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,100px)", alignItems: "center" }}>
          {/* Left image — stone texture */}
          <Fade d={0.1}>
            <div style={{ overflow: "hidden" }}>
              <img src={img("images/about_page_img_1.jpg")} alt="stone texture" loading="lazy" decoding="async" style={{
                width: "100%", height: "clamp(400px,55vw,680px)", objectFit: "cover", display: "block",
                transition: "transform .7s ease",
              }}
                onMouseOver={e => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
          </Fade>

          {/* Right text */}
          <Fade d={0.2}>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 32 }}>OUR VALUES</p>
            <h2 style={{ fontSize: "clamp(22px,2.4vw,34px)", fontWeight: 300, lineHeight: 1.35, color: "#1c1917", margin: "0 0 52px" }}>
              Driven by nature's artistry,<br />selected with precision.<br />Integrity in every vein.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {VALUES.map((v, i) => (
                <div key={v.title} style={{ borderTop: "1px solid #e2e0de", padding: "26px 0", ...(i === VALUES.length - 1 ? { borderBottom: "1px solid #e2e0de" } : {}) }}>
                  <div style={{ marginBottom: 16 }}>{v.icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px", letterSpacing: "0.01em" }}>{v.title}</p>
                  <p style={{ fontSize: 13, color: "#78716c", lineHeight: 1.75, margin: 0, maxWidth: 420 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══ GALLERY — two images ══ */}
      <section style={{ padding: "clamp(60px,8vw,110px) clamp(24px,5vw,64px) clamp(40px,5vw,70px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div className="about-gallery-grid" style={{ display: "grid", gridTemplateColumns: "5fr 12fr", gap: "clamp(16px,2.5vw,40px)", alignItems: "end" }}>
            {/* Tall vertical image */}
            <Fade d={0.1}>
              <div style={{ overflow: "hidden" }}>
                <img src={img("images/about_page_img_2.jpg")} alt="stone building" loading="lazy" decoding="async" style={{
                  width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block",
                  transition: "transform .7s ease",
                }}
                  onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
                <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a8a29e", margin: "14px 0 0", lineHeight: 1.6 }}>Supplying premium slabs for more than 400 exclusive projects</p>
              </div>
            </Fade>
            {/* Wide landscape image */}
            <Fade d={0.2}>
              <div style={{ overflow: "hidden" }}>
                <img src={img("images/about_page_img_3.jpg")} alt="stone facade" loading="lazy" decoding="async" style={{
                  width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block",
                  transition: "transform .7s ease",
                }}
                  onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
                <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a8a29e", margin: "14px 0 0", textAlign: "center" }}>Supplying premium slabs for more than 400 exclusive projects</p>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* ══ OUR APPROACH — two-col text ══ */}
      <section style={{ padding: "clamp(40px,6vw,80px) clamp(24px,5vw,64px) clamp(60px,8vw,110px)" }}>
        <div className="about-approach-grid" style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>
          <Fade>
            <h2 style={{ fontSize: "clamp(24px,2.6vw,38px)", fontWeight: 300, lineHeight: 1.25, color: "#1c1917", margin: "0 0 28px" }}>
              Our approach. From the quarry to reality.
            </h2>
            <ArrowLink onClick={() => onNavigate("contact")}>Contact us</ArrowLink>
          </Fade>
          <Fade d={0.15}>
            <p style={{ fontSize: "clamp(14px,1.05vw,15px)", fontWeight: 300, lineHeight: 1.85, color: "#57534e", margin: 0 }}>
              We oversee every aspect of your premium stone selection — from the initial consultation to the final delivery. Our team delivers tailored material solutions, guides you through book-matching and finishes with clarity, and manages the intricate details of sourcing and logistics. We collaborate closely with trusted industry professionals — architects, interior designers, elite contractors, and installation specialists — to ensure your vision is brought to life flawlessly.
            </p>
          </Fade>
        </div>
      </section>

      {/* ══ FULL-WIDTH IMAGE ══ */}
      <section style={{ height: "clamp(360px,48vw,620px)", overflow: "hidden" }}>
        <img src={img("images/about_page_img_4.jpg")} alt="luxury interior stone" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" }} />
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(24px,3vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "clamp(32px,4vw,48px)", alignItems: "start" }}>
          <div>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 10px" }}>info@koohkaran.com</p>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 10px" }}>09173090000</p>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 32px", lineHeight: 1.6 }}>Shatti Al Qurum, Block 228<br />Muscat, Oman</p>
            <ArrowLink onClick={() => onNavigate("contact")}>Contact us</ArrowLink>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <img src={img("images/logo.png")} alt="logo" style={{ width: 56, height: 56 }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.14em", margin: "0 0 3px" }}>KOOHKARAN</p>
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#a8a29e", margin: 0 }}>SLAB MARKET</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {[["Home","Services"],["About","Products"],["Contact Us","Events"],["Our Process","Journal"]].map(([a,b],i) => (
              <React.Fragment key={i}>
                <button onClick={() => a === "Home" ? onNavigate("home") : a === "Contact Us" ? onNavigate("contact") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{a}</button>
                <button onClick={() => b === "Products" ? onNavigate("products") : b === "Journal" ? onNavigate("journal") : b === "Events" ? onNavigate("events") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{b}</button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #f0ede8", padding: "clamp(14px,2vw,20px) clamp(24px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>© 2002 - 2026 koohkaran. Terms</p>
          <div style={{ display: "flex", gap: 18 }}>
            {["●","◆","◻","◯"].map((s,i) => <span key={i} style={{ fontSize: 10, color: "#d6d3d1", cursor: "pointer" }}>{s}</span>)}
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "1px solid #e7e5e4", padding: "7px 12px", cursor: "pointer", color: "#a8a29e", fontSize: 14 }}>↑</button>
        </div>
      </footer>
    </div>
  );
}
