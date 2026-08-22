import { img } from "./utils";
import NavHeaderActions from "./components/NavHeaderActions";
import { EVENTS, getEvent } from "./events";
import { useState, useEffect, useRef } from "react";
import React from "react";

type Page = "home" | "contact" | "about" | "journal" | "article" | "products" | "product" | "events" | "event";

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
    <div ref={ref} className="scroll-fade" style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .9s cubic-bezier(0.16,1,0.3,1) ${d}s, transform .9s cubic-bezier(0.16,1,0.3,1) ${d}s`, ...style }}>
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

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: "clamp(15px,1.15vw,17px)", fontWeight: 300, lineHeight: 1.85, color: "#3a3530", margin: "0 0 22px" }}>{children}</p>
);

export default function EventDetailPage({ onNavigate, eventId }: { onNavigate: (p: Page, id?: number) => void; eventId: number }) {
  const event = getEvent(eventId);
  const related = EVENTS.filter(e => e.id !== event.id).slice(0, 3);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Urbanist', 'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#1c1917", overflowX: "hidden" }}>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {(["Home", "About", "Products", "Events", "Journal"] as const).map(n => (
          <button key={n} className="mobile-menu-link" onClick={() => {
            setMenuOpen(false);
            if (n === "Home") onNavigate("home");
            else if (n === "About") onNavigate("about");
            else if (n === "Products") onNavigate("products");
            else if (n === "Journal") onNavigate("journal");
            else if (n === "Events") onNavigate("events");
          }}>{n}</button>
        ))}
        <button className="mobile-menu-contact" onClick={() => { setMenuOpen(false); onNavigate("contact"); }}>Contact Us</button>
      </div>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "clamp(12px,2vw,20px) clamp(24px,5vw,64px)",
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.35)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
        transition: "background .35s ease, box-shadow .35s ease, border-color .35s ease",
      }}>
        <button onClick={() => { setMenuOpen(false); onNavigate("home"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: 201 }}>
          <img src={img("images/logo.png")} alt="Koohkaran" style={{ width: 42, height: 42 }} />
        </button>
        <nav className="site-nav" style={{ gap: "clamp(20px,3vw,44px)" }}>
          {(["Home", "About", "Products", "Events", "Journal"] as const).map((n, i) => (
            <button key={n}
              onClick={() => n === "Home" ? onNavigate("home") : n === "About" ? onNavigate("about") : n === "Products" ? onNavigate("products") : n === "Journal" ? onNavigate("journal") : n === "Events" ? onNavigate("events") : undefined}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: 14, color: "#292524",
                textDecoration: i === 3 ? "underline" : "none", textUnderlineOffset: 5,
                letterSpacing: "0.01em", fontFamily: "inherit",
              }}>{n}</button>
          ))}
        </nav>
        <NavHeaderActions onContact={() => onNavigate("contact")} />
        <button className={`menu-btn${menuOpen ? " open" : ""}`} aria-label="menu" onClick={() => setMenuOpen(o => !o)} style={{ color: "#1c1917" }}>
          <span /><span /><span />
        </button>
      </header>

      <section style={{ padding: "clamp(120px,14vw,180px) clamp(24px,5vw,64px) clamp(32px,4vw,52px)", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 22px" }}>{event.cat}</p>
          <h1 style={{ fontSize: "clamp(32px,4.4vw,64px)", fontWeight: 300, lineHeight: 1.12, margin: "0 0 22px", color: "#1c1917", maxWidth: 900, marginInline: "auto" }}>{event.title}</h1>
          <p style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 8px" }}>{event.date}</p>
          <p style={{ fontSize: 13, color: "#78716c", margin: 0 }}>{event.location}</p>
        </Fade>
      </section>

      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(48px,6vw,80px)" }}>
        <Fade>
          <div style={{ maxWidth: 1240, margin: "0 auto", overflow: "hidden" }}>
            <img src={img(event.heroImage)} alt={event.title} decoding="async" style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }} />
          </div>
        </Fade>
      </section>

      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,100px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontSize: "clamp(17px,1.4vw,20px)", fontWeight: 300, lineHeight: 1.75, color: "#1c1917", margin: "0 0 32px" }}>{event.excerpt}</p>
            {event.body.map((paragraph, i) => (
              <P key={i}>{paragraph}</P>
            ))}
            <button onClick={() => onNavigate("contact")} style={{
              marginTop: 16, fontSize: 13, letterSpacing: "0.06em", padding: "14px 36px", cursor: "pointer",
              border: "1px solid #1c1917", color: "#fff", background: "#1c1917", fontFamily: "inherit",
            }}>Register interest</button>
          </Fade>
        </div>
      </section>

      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,110px)" }}>
        <div className="max-w-site">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(28px,3.5vw,48px)" }}>
            <h2 style={{ fontSize: "clamp(22px,2.4vw,34px)", fontWeight: 300, margin: 0, color: "#1c1917" }}>More events</h2>
            <ArrowLink onClick={() => onNavigate("events")}>All events</ArrowLink>
          </div>
          <div className="journal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(20px,2.5vw,40px)" }}>
            {related.map((e, i) => (
              <Fade key={e.id} d={i * 0.08}>
                <div style={{ cursor: "pointer" }} onClick={() => onNavigate("event", e.id)}>
                  <div style={{ overflow: "hidden", marginBottom: 16, aspectRatio: "4/3" }}>
                    <img src={img(e.image)} alt={e.title} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s ease" }}
                      onMouseOver={el => (el.currentTarget.style.transform = "scale(1.05)")}
                      onMouseOut={el => (el.currentTarget.style.transform = "scale(1)")} />
                  </div>
                  <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 8px" }}>{e.cat}</p>
                  <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 6px", color: "#1c1917" }}>{e.title}</h3>
                  <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#78716c", margin: 0 }}>{e.date}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <div className="footer-grid" style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(24px,3vw,40px)" }}>
          <div>
            <p style={{ fontSize: 13, color: "#57534e", margin: "0 0 32px" }}>info@koohkaran.com</p>
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
                <button onClick={() => b === "Products" ? onNavigate("products") : b === "Journal" ? onNavigate("journal") : b === "Events" ? onNavigate("events") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{b}</button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="footer-bar" style={{ borderTop: "1px solid #f0ede8", padding: "clamp(14px,2vw,20px) clamp(24px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>© 2002 - 2026 koohkaran. Terms</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "1px solid #e7e5e4", padding: "7px 12px", cursor: "pointer", color: "#a8a29e", fontSize: 14 }}>↑</button>
        </div>
      </footer>
    </div>
  );
}
