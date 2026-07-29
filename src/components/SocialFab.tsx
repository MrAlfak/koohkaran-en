import { useState, useEffect } from "react";

const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/koohkaran",
    color: "#E1306C",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/989173090000",
    color: "#25D366",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.18 8.18 0 01-4.178-1.145l-.3-.178-2.868.855.855-2.795-.195-.305A8.182 8.182 0 1112 20.182z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/koohkaran",
    color: "#229ED9",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.94 4.655A1.5 1.5 0 0020.5 4.1L3.5 11.1a1.5 1.5 0 00.05 2.82l4.2 1.4 1.6 5.1a1 1 0 001.55.45l2.35-2.15 4.35 3.2a1.5 1.5 0 002.35-.95l2.5-14.5a1.5 1.5 0 00-2.06-1.72zM9.7 14.3l-.3 4.2 1-3.1 6.8-6.1-6.5 5z" />
      </svg>
    ),
  },
] as const;

export default function SocialFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="social-fab" onClick={e => e.stopPropagation()}>
      <div className={`social-fab-links${open ? " open" : ""}`}>
        {SOCIAL_LINKS.map((link, i) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-fab-link"
            aria-label={link.label}
            title={link.label}
            style={{ transitionDelay: open ? `${i * 55}ms` : "0ms", color: link.color }}
          >
            {link.icon}
          </a>
        ))}
      </div>
      <button
        type="button"
        className={`social-fab-toggle${open ? " open" : ""}`}
        aria-label={open ? "Close social links" : "Open social links"}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="social-fab-plus" />
      </button>
    </div>
  );
}
