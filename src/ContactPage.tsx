import { img } from "./utils";
import NavHeaderActions from "./components/NavHeaderActions";
import { useState } from "react";

interface Props {
  onNavigate: (page: string) => void;
}

function Input({ label, type = "text", name }: { label: string; type?: string; name: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 8 }}>{label}</label>
      <input
        type={type}
        name={name}
        style={{
          width: "100%", height: 52, padding: "0 16px",
          border: "1px solid #d6d3d1", background: "#fff",
          fontSize: 14, color: "#1c1917", outline: "none",
          fontFamily: "inherit", boxSizing: "border-box",
          transition: "border-color .2s",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "#1c1917")}
        onBlur={e => (e.currentTarget.style.borderColor = "#d6d3d1")}
      />
    </div>
  );
}

export default function ContactPage({ onNavigate }: Props) {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ fontFamily: "'Urbanist', 'Helvetica Neue', Arial, sans-serif", background: "#fff", color: "#1c1917", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px clamp(24px,5vw,64px)",
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.35)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <img src={img("images/logo.png")} alt="Koohkaran" style={{ width: 42, height: 42 }} />
        </button>
        <nav style={{ display: "flex", gap: "clamp(20px,3vw,44px)" }}>
          {(["Home", "About", "Products", "Events", "Journal"] as const).map(n => (
            <button key={n} onClick={() => {
              if (n === "Home") onNavigate("home");
              else if (n === "About") onNavigate("about");
              else if (n === "Products") onNavigate("products");
              else if (n === "Events") onNavigate("events");
              else if (n === "Journal") onNavigate("journal");
            }} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: "#57534e", letterSpacing: "0.01em", padding: 0,
              fontFamily: "inherit",
            }}>{n}</button>
          ))}
        </nav>
        <NavHeaderActions onContact={() => {}} tone="filled" />
      </header>

      {/* ── HERO BAR ── */}
      <div style={{ paddingTop: 80, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>

        {/* LEFT — Form */}
        <div style={{ padding: "clamp(60px,8vw,100px) clamp(32px,5vw,80px) clamp(60px,8vw,100px) clamp(32px,5vw,80px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 20 }}>GET IN TOUCH</p>
          <h1 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 300, margin: "0 0 12px", lineHeight: 1.2 }}>Contact Us</h1>
          <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.7, marginBottom: 48, maxWidth: 440 }}>
            From expert consultation to the perfect choice, we guide you in finding the most suitable stone for your space.
          </p>

          {sent ? (
            <div style={{ padding: "32px", background: "#f7f7f7", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 400, margin: "0 0 8px" }}>Thank you!</p>
              <p style={{ fontSize: 13, color: "#78716c", margin: 0 }}>We'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Input label="Full Name" name="name" />
                <Input label="Email Address" type="email" name="email" />
                <Input label="Phone Number" type="tel" name="phone" />
                <Input label="City" name="city" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Input label="Company / Project" name="company" />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 8 }}>Message</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us about your project..."
                  style={{
                    width: "100%", padding: "14px 16px",
                    border: "1px solid #d6d3d1", background: "#fff",
                    fontSize: 14, color: "#1c1917", outline: "none",
                    fontFamily: "inherit", resize: "vertical",
                    boxSizing: "border-box", transition: "border-color .2s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1c1917")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#d6d3d1")}
                />
              </div>
              <button type="submit" style={{
                width: "100%", height: 52, background: "#1c1917", color: "#fff",
                border: "none", fontSize: 13, letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer",
                fontFamily: "inherit", transition: "background .2s",
              }}
                onMouseOver={e => (e.currentTarget.style.background = "#292524")}
                onMouseOut={e => (e.currentTarget.style.background = "#1c1917")}
              >
                Send Message
              </button>
            </form>
          )}

          {/* Contact Info */}
          <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 40px" }}>
            {[
              { label: "Email", val: "info@koohkaran.com" },
              { label: "Hours", val: "Mon – Fri\n8:00 AM – 5:00 PM" },
            ].map(({ label, val }) => (
              <div key={label}>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 13, color: "#1c1917", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Image */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={img("images/contact_img_1.jpg")}
            alt="stone building"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,0.06) 0%, transparent 40%)" }} />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #f0ede8" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(40px,5vw,64px) clamp(24px,5vw,64px) clamp(20px,3vw,32px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}>
          <div>
            <p style={{ fontSize: 13, color: "#57534e", margin: 0 }}>info@koohkaran.com</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <img src={img("images/logo.png")} alt="logo" style={{ width: 52, height: 52 }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.14em", margin: "0 0 2px" }}>KOOHKARAN</p>
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#a8a29e", margin: 0 }}>SLAB MARKET</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
            {[["Home","Services"],["About","Products"],["Contact Us","Events"],["Our Process","Journal"]].map(([a,b],i) => (
              <React.Fragment key={i}>
                <button onClick={() => a === "Home" ? onNavigate("home") : a === "About" ? onNavigate("about") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{a}</button>
                <button onClick={() => b === "Products" ? onNavigate("products") : b === "Journal" ? onNavigate("journal") : b === "Events" ? onNavigate("events") : undefined}
                  style={{ fontSize: 13, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>{b}</button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #f0ede8", padding: "16px clamp(24px,5vw,64px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>© 2002 - 2026 koohkaran. Terms</p>
          <button onClick={() => onNavigate("home")} style={{ background: "none", border: "1px solid #e7e5e4", padding: "6px 12px", cursor: "pointer", color: "#a8a29e", fontSize: 14 }}>↑</button>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
