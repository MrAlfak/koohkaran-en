import { img } from "./utils";
import NavHeaderActions from "./components/NavHeaderActions";
import { PRODUCTS, getProduct } from "./products";
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

const SPECS = (product: ReturnType<typeof getProduct>) => [
  { label: "Product Code", val: product.code },
  { label: "Stone Type", val: product.cat },
  { label: "Size", val: product.size },
  { label: "Surface Finish", val: product.finish },
  { label: "Origin", val: product.origin },
  { label: "Color Spectrum", val: product.colors },
];

export default function ProductDetailPage({ onNavigate, productId }: { onNavigate: (p: Page, id?: number) => void; productId: number }) {
  const product = getProduct(productId);
  const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);
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
            else if (n === "Events") onNavigate("events");
            else if (n === "Products") onNavigate("products");
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
                textDecoration: i === 2 ? "underline" : "none", textUnderlineOffset: 5,
                letterSpacing: "0.01em", fontFamily: "inherit",
              }}>{n}</button>
          ))}
        </nav>
        <NavHeaderActions onContact={() => onNavigate("contact")} />
        <button className={`menu-btn${menuOpen ? " open" : ""}`} aria-label="menu" onClick={() => setMenuOpen(o => !o)} style={{ color: "#1c1917" }}>
          <span /><span /><span />
        </button>
      </header>

      {/* ══ TITLE ══ */}
      <section style={{ padding: "clamp(120px,14vw,180px) clamp(24px,5vw,64px) clamp(28px,3.5vw,44px)", textAlign: "center" }}>
        <Fade>
          <h1 style={{ fontSize: "clamp(30px,4vw,56px)", fontWeight: 300, lineHeight: 1.1, margin: "0 0 16px", color: "#1c1917" }}>{product.name}</h1>
          <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>{product.code}&nbsp;&nbsp;·&nbsp;&nbsp;{product.cat}</p>
        </Fade>
      </section>

      {/* ══ HERO IMAGE ══ */}
      <section style={{ padding: "0 clamp(24px,5vw,64px)" }}>
        <Fade>
          <div style={{ maxWidth: 1240, margin: "0 auto", overflow: "hidden" }}>
            <img src={img(product.heroImage)} alt={product.name} decoding="async" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
          </div>
        </Fade>
      </section>

      {/* ══ SPECS ══ */}
      <section style={{ padding: "clamp(40px,5vw,72px) clamp(24px,5vw,64px)" }}>
        <div className="prod-spec-row" style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 32 }}>
          <div className="prod-specs" style={{ display: "flex", flexWrap: "wrap", gap: "28px clamp(36px,5vw,72px)" }}>
            {SPECS(product).map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 8px" }}>{s.label}</p>
                <p style={{ fontSize: 15, color: "#1c1917", margin: 0 }}>{s.val}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate("contact")} style={{
            fontSize: 13, letterSpacing: "0.04em", padding: "13px 34px", cursor: "pointer",
            border: "1px solid #1c1917", color: "#1c1917", background: "transparent", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>Order Now</button>
        </div>
      </section>

      {/* ══ PRODUCT DETAILS ══ */}
      <section style={{ padding: "clamp(40px,5vw,72px) clamp(24px,5vw,64px) clamp(32px,4vw,56px)", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(24px,2.8vw,40px)", fontWeight: 300, margin: "0 0 14px", color: "#1c1917" }}>Product details</h2>
          {product.description && (
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#57534e", maxWidth: 720, margin: "0 auto" }}>{product.description}</p>
          )}
        </Fade>
      </section>

      {/* ══ DETAIL IMAGE ══ */}
      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,110px)" }}>
        <Fade>
          <div style={{ maxWidth: 1240, margin: "0 auto", overflow: "hidden" }}>
            <img src={img(product.detailImage)} alt={`${product.name} detail`} loading="lazy" decoding="async" style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block" }} />
          </div>
        </Fade>
      </section>

      {/* ══ RELATED ══ */}
      <section style={{ padding: "0 clamp(24px,5vw,64px) clamp(60px,8vw,110px)" }}>
        <div className="max-w-site">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(28px,3.5vw,48px)" }}>
            <h2 style={{ fontSize: "clamp(22px,2.4vw,34px)", fontWeight: 300, margin: 0, color: "#1c1917" }}>Related products</h2>
            <ArrowLink onClick={() => onNavigate("products")}>All products</ArrowLink>
          </div>
          <div className="prod-related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(20px,2.5vw,40px)" }}>
            {related.map((p, i) => (
              <Fade key={p.name} d={i * 0.08}>
                <div style={{ cursor: "pointer" }} onClick={() => onNavigate("product", p.id)}>
                  <div style={{ overflow: "hidden", marginBottom: 16, aspectRatio: "4/3" }}>
                    <img src={img(p.image)} alt={p.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s ease" }}
                      onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 5px", color: "#1c1917" }}>{p.name}</h3>
                  <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>{p.code}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

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
                <button onClick={() => b === "Products" ? onNavigate("products") : b === "Journal" ? onNavigate("journal") : b === "Events" ? onNavigate("events") : undefined}
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
