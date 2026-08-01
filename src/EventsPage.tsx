import { img } from "./utils";
import NavHeaderActions from "./components/NavHeaderActions";
import { EVENTS } from "./events";
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
    <div ref={ref} className="scroll-fade" style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .8s ease ${d}s, transform .8s ease ${d}s`, ...style }}>
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

const TABS = ["All", "Exhibitions", "Launches", "Workshops", "Fairs", "Announcements"] as const;

function EventCard({ event, onOpen }: { event: typeof EVENTS[number]; onOpen: () => void }) {
  return (
    <div style={{ cursor: "pointer" }} onClick={onOpen}>
      <div style={{ overflow: "hidden", marginBottom: 16 }}>
        <img src={img(event.image)} alt={event.title} loading="lazy" decoding="async" style={{
          width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block",
          transition: "transform .7s ease",
        }}
          onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
      </div>
      <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 8px" }}>{event.cat}</p>
      <h3 style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.3, margin: "0 0 10px", color: "#1c1917" }}>{event.title}</h3>
      <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#78716c", margin: "0 0 8px" }}>{event.date}</p>
      <p style={{ fontSize: 13, color: "#78716c", lineHeight: 1.7, margin: 0 }}>{event.excerpt}</p>
    </div>
  );
}

export default function EventsPage({ onNavigate }: { onNavigate: (p: Page, id?: number) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const list = EVENTS.filter(e => activeCat === "All" || e.cat === activeCat);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#1c1917", overflowX: "hidden" }}>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {(["Home", "About", "Products", "Events", "Journal"] as const).map(n => (
          <button key={n} className="mobile-menu-link" onClick={() => {
            setMenuOpen(false);
            if (n === "Home") onNavigate("home");
            else if (n === "About") onNavigate("about");
            else if (n === "Products") onNavigate("products");
            else if (n === "Journal") onNavigate("journal");
            else if (n === "Events") window.scrollTo({ top: 0, behavior: "smooth" });
          }}>{n}</button>
        ))}
        <button className="mobile-menu-contact" onClick={() => { setMenuOpen(false); onNavigate("contact"); }}>Contact Us</button>
      </div>

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

      <section style={{ padding: "clamp(120px,14vw,180px) clamp(24px,5vw,64px) clamp(40px,5vw,64px)" }}>
        <div className="max-w-site journal-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 32 }}>
          <Fade>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 20px" }}>Events</p>
            <h1 style={{ fontSize: "clamp(28px,3.4vw,52px)", fontWeight: 300, lineHeight: 1.2, margin: 0, color: "#1c1917" }}>
              Exhibitions, launches &amp;<br />stone industry gatherings.
            </h1>
          </Fade>
          <Fade d={0.1}>
            <div className="journal-tabs" style={{ display: "flex", gap: "clamp(16px,1.6vw,28px)", flexWrap: "wrap" }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveCat(t)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: "inherit",
                    fontSize: 13, letterSpacing: "0.01em",
                    color: activeCat === t ? "#1c1917" : "#78716c",
                    textDecoration: activeCat === t ? "underline" : "none", textUnderlineOffset: 6,
                    transition: "color .2s",
                  }}>{t}</button>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,110px)" }}>
        <div className="max-w-site journal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(28px,3vw,48px)" }}>
          {list.map((event, i) => (
            <Fade key={event.id} d={(i % 3) * 0.08}>
              <EventCard event={event} onOpen={() => onNavigate("event", event.id)} />
            </Fade>
          ))}
        </div>
        {list.length === 0 && (
          <p style={{ color: "#a8a29e", fontSize: 14, margin: 0 }}>No events in this category yet.</p>
        )}
      </section>

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
