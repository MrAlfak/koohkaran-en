import { img } from "./utils";
import NavHeaderActions from "./components/NavHeaderActions";
import { useState, useEffect, useRef } from "react";
import React from "react";

type Page = "home" | "contact" | "about" | "journal" | "article" | "products" | "events" | "event";

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
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .8s ease ${d}s, transform .8s ease ${d}s`, ...style }}>
      {children}
    </div>
  );
}
function ArrowLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#1c1917", background: "none", border: "none", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #1c1917", paddingBottom: 2, fontFamily: "inherit" }}>
      {children}
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="#1c1917" strokeWidth="1.3">
        <line x1="0" y1="5" x2="16" y2="5" /><polyline points="11,1 16,5 11,9" />
      </svg>
    </button>
  );
}

const aimg = (n: number) => img(`images/injournal_img_${n}.jpg`);

/* body paragraph */
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: "clamp(15px,1.15vw,17px)", fontWeight: 300, lineHeight: 1.85, color: "#3a3530", margin: "0 0 22px" }}>{children}</p>
);
/* subheading */
const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: "clamp(20px,1.9vw,26px)", fontWeight: 400, lineHeight: 1.3, color: "#1c1917", margin: "44px 0 20px" }}>{children}</h2>
);

export default function ArticlePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#1c1917", overflowX: "hidden" }}>

      {/* ══ MOBILE MENU ══ */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {(["Home", "About", "Products", "Events", "Journal"] as const).map(n => (
          <button key={n} className="mobile-menu-link" onClick={() => {
            setMenuOpen(false);
            if (n === "Home") onNavigate("home");
            else if (n === "About") onNavigate("about");
            else if (n === "Journal") onNavigate("journal");
            else if (n === "Products") onNavigate("products");
            else if (n === "Events") onNavigate("events");
          }}>{n}</button>
        ))}
        <button className="mobile-menu-contact" onClick={() => { setMenuOpen(false); onNavigate("contact"); }}>Contact Us</button>
      </div>

      {/* ══ NAV ══ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "clamp(12px,2vw,20px) clamp(24px,5vw,64px)",
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(14px)",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "none", transition: "box-shadow .4s",
      }}>
        <button onClick={() => { setMenuOpen(false); onNavigate("home"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: 201 }}>
          <img src={img("images/logo.png")} alt="Koohkaran" style={{ width: 42, height: 42 }} />
        </button>
        <nav className="site-nav" style={{ gap: "clamp(20px,3vw,44px)" }}>
          {(["Home", "About", "Products", "Events", "Journal"] as const).map((n, i) => (
            <button key={n}
              onClick={() => n === "Home" ? onNavigate("home") : n === "About" ? onNavigate("about") : n === "Journal" ? onNavigate("journal") : n === "Products" ? onNavigate("products") : n === "Events" ? onNavigate("events") : undefined}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: 14, color: "#292524",
                textDecoration: i === 4 ? "underline" : "none", textUnderlineOffset: 5,
                letterSpacing: "0.01em", fontFamily: "inherit",
              }}>{n}</button>
          ))}
        </nav>
        <NavHeaderActions onContact={() => onNavigate("contact")} />
        <button className={`menu-btn${menuOpen ? " open" : ""}`} aria-label="menu" onClick={() => setMenuOpen(o => !o)} style={{ color: "#1c1917" }}>
          <span /><span /><span />
        </button>
      </header>

      {/* ══ ARTICLE HEADER ══ */}
      <section style={{ padding: "clamp(120px,14vw,180px) clamp(24px,5vw,64px) clamp(32px,4vw,52px)", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 22px" }}>Exteriors</p>
          <h1 style={{ fontSize: "clamp(32px,4.4vw,64px)", fontWeight: 300, lineHeight: 1.12, margin: "0 0 22px", color: "#1c1917" }}>The beauty of restraint</h1>
          <p style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>MAY&nbsp;&nbsp;|&nbsp;&nbsp;2026</p>
        </Fade>
      </section>

      {/* ══ HERO IMAGE ══ */}
      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(48px,6vw,80px)" }}>
        <Fade>
          <div style={{ maxWidth: 1240, margin: "0 auto", overflow: "hidden" }}>
            <img src={aimg(3)} alt="The beauty of restraint" style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }} />
          </div>
        </Fade>
      </section>

      {/* ══ BODY ══ */}
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(24px,5vw,40px)" }}>
        <Fade>
          <p style={{ fontSize: "clamp(15px,1.15vw,17px)", fontWeight: 300, lineHeight: 1.85, color: "#3a3530", margin: "0 0 22px" }}>
            <span style={{ float: "left", fontSize: "clamp(52px,5vw,74px)", lineHeight: 0.82, fontWeight: 300, margin: "6px 14px 0 0", color: "#1c1917" }}>L</span>
            ooking to create a bedroom that feels like a peaceful retreat? This project showcases how a relaxing bedroom design can turn any space into a serene sanctuary. With calming colors, cozy textures, and thoughtful touches, this transformation demonstrates the ultimate place for rest and relaxation.
          </p>
          <P>The result is a space that invites rest, promotes relaxation, and provides a true escape from the hustle of daily life. Whether you're starting from scratch or refreshing an existing room, this project demonstrates how small changes can significantly impact your well-being.</P>
        </Fade>

        <Fade><H>The Challenge: Relaxing Bedroom Design Ideas</H></Fade>
        <Fade>
          <P>The client turned to Koohkaran with a clear goal: to transform a plain bedroom into a space that felt more serene, inviting, and livable. Their focus was on the bedroom — a fresh, contemporary design. They envisioned a relaxing and neutral palette built for rest and tranquility, without requiring major structural renovations.</P>
          <P>Except for the existing doors and beautiful light oak flooring, every element was open to reimagining. This gave the designer ample creative freedom to craft a result that would be a bedroom that not only looks beautiful but also supports comfort — an ideal sanctuary for unwinding.</P>
        </Fade>
      </article>

      {/* ══ IMAGE PAIR ══ */}
      <section style={{ padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px)" }}>
        <div className="article-pair" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px,2vw,28px)" }}>
          <Fade><div style={{ overflow: "hidden" }}><img src={aimg(0)} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} /></div></Fade>
          <Fade d={0.1}><div style={{ overflow: "hidden" }}><img src={aimg(1)} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} /></div></Fade>
        </div>
      </section>

      {/* ══ BODY 2 ══ */}
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(24px,5vw,40px)" }}>
        <Fade><H>A Calm, Considered Material Palette</H></Fade>
        <Fade>
          <P>Natural stone anchors the entire scheme. Honed surfaces in soft, earthen tones bring quiet depth to the walls, while the grain is allowed to speak for itself — no busy patterning, no competing finishes. Restraint, here, is the point: each material is chosen to recede, letting light and texture carry the room.</P>
          <P>Warm neutrals, tactile textiles, and matte stone work together so that nothing shouts. The palette stays deliberately narrow, and the result feels cohesive, grounded, and effortless to live with day after day.</P>
        </Fade>
      </article>

      {/* ══ FULL-WIDTH IMAGE ══ */}
      <section style={{ height: "clamp(360px,46vw,600px)", overflow: "hidden", margin: "clamp(40px,5vw,72px) 0" }}>
        <Fade style={{ height: "100%" }}>
          <img src={aimg(4)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </Fade>
      </section>

      {/* ══ BODY 3 ══ */}
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(24px,5vw,40px)" }}>
        <Fade><H>Light, Texture, and the Art of Restraint</H></Fade>
        <Fade>
          <P>Natural light boosts mood, brightens the space, and makes even modest rooms feel open and airy. The design leans into it — sheer layers soften the glare, while stone and oak catch the changing light through the day, shifting subtly from morning to dusk.</P>
          <P>This is restraint as a design philosophy: doing less, but doing it precisely. The bedroom becomes a place that protects sleep, supports recovery, and removes friction from how you move through the space — an ideal sanctuary for unwinding.</P>
        </Fade>
      </article>

      {/* ══ IMAGE PAIR 2 ══ */}
      <section style={{ padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px)" }}>
        <div className="article-pair" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px,2vw,28px)" }}>
          <Fade><div style={{ overflow: "hidden" }}><img src={aimg(5)} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} /></div></Fade>
          <Fade d={0.1}><div style={{ overflow: "hidden" }}><img src={aimg(6)} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} /></div></Fade>
        </div>
      </section>

      {/* ══ CLOSING + BACK ══ */}
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(24px,5vw,40px) clamp(60px,8vw,110px)", textAlign: "center" }}>
        <Fade>
          <P>The beauty of restraint is that it lasts. Free of trend and excess, the room remains calm, timeless, and deeply personal — proof that simplicity is the highest form of elegance.</P>
          <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
            <ArrowLink onClick={() => onNavigate("journal")}>Back to Journal</ArrowLink>
          </div>
        </Fade>
      </article>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <div className="footer-grid" style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(24px,3vw,40px)" }}>
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
            {[["Home", "Services"], ["About", "Products"], ["Contact Us", "Events"], ["Our Process", "Journal"]].map(([a, b], i) => (
              <React.Fragment key={i}>
                <button onClick={() => a === "Home" ? onNavigate("home") : a === "Contact Us" ? onNavigate("contact") : a === "About" ? onNavigate("about") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{a}</button>
                <button onClick={() => b === "Journal" ? onNavigate("journal") : b === "Products" ? onNavigate("products") : b === "Events" ? onNavigate("events") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{b}</button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="footer-bar" style={{ borderTop: "1px solid #f0ede8", padding: "clamp(14px,2vw,20px) clamp(24px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>© 2002 - 2026 koohkaran. Terms</p>
          <div style={{ display: "flex", gap: 18 }}>
            {["●", "◆", "◻", "◯"].map((s, i) => <span key={i} style={{ fontSize: 10, color: "#d6d3d1", cursor: "pointer" }}>{s}</span>)}
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "1px solid #e7e5e4", padding: "7px 12px", cursor: "pointer", color: "#a8a29e", fontSize: 14 }}>↑</button>
        </div>
      </footer>
    </div>
  );
}
