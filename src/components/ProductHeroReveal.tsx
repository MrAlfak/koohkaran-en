import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import type { StoneLight } from "./stoneLight";

// three.js is a large chunk and the light cannot start until it has arrived, so
// the fetch is kicked off the moment this module is evaluated rather than when a
// hero mounts. That overlaps it with the app's own boot instead of queueing it
// behind the first render, which is worth about a second on a cold load.
let stoneLightChunk: Promise<typeof import("./stoneLight")> | null = null;
const loadStoneLight = () => (stoneLightChunk ??= import("./stoneLight"));
loadStoneLight();

/*
  Hero reveal for product detail pages.

  Timeline: the image sits shaded and a band of light rakes across it left →
  right. As the light leaves, the product name draws itself over the dark slab in
  outline; the white then rises in place behind the finished outline, everywhere
  except the name, which is a hole punched through it, so the stone underneath
  reads as the letterforms.

  The light pass runs on the GPU (see stoneLight.ts) so it can shade against
  relief taken from the photograph itself, rather than just re-exposing it. The
  wash stays in CSS, because it needs the product name knocked out of it and an
  SVG text mask does that better than a shader would.

  The <img> under the canvas is the fallback: with no WebGL there is no light
  pass, but the frame and the name reveal still read correctly.
*/

const HOLD = 0.15;   // beat before the light arrives
const SWEEP = 6.2;   // light crossing the frame
const GAP = 0;       // beat of full colour before the wash
const LINE = 2.2;    // the name drawing itself in outline
const OVERLAP = 2.4; // the outline starts well before the light has finished
const WASH = 1.2;    // white rising in place behind the finished outline

/*
  Outline length per character, as a multiple of the font size.

  <text> has no getTotalLength, so the dash length has to come from the glyphs
  themselves. What has to fit inside a single dash is not the whole word: SVG
  restarts the dash pattern at every contour, so the word is hidden only once the
  dash is longer than its longest single contour. A dash below that leaves the
  tail of the widest letter on screen from the moment the page loads — which is
  what a flat per-glyph guess did to every name containing a W or an M.

  Measured off the display face (Urbanist 700) by binary-searching the dash
  length at which each glyph disappears. Re-measure if that face changes.
*/
const GLYPH_EM: Record<string, number> = {
  W: 4.94, M: 4.69, N: 3.99, G: 3.80, Z: 3.64, H: 3.62, X: 3.55, S: 3.44,
  K: 3.42, E: 3.41, U: 3.34, C: 3.10, V: 3.09, R: 2.82, F: 2.71, Y: 2.54,
  T: 2.50, A: 2.45, Q: 2.44, D: 2.26, B: 2.24, L: 2.23, O: 2.22, P: 2.13,
  J: 1.95, I: 1.64, "3": 3.04, "&": 2.73, "(": 1.91, ")": 1.91, "/": 1.81,
  "-": 0.88,
};
// a character no one has measured yet is assumed to be longer than any that has
const GLYPH_EM_MAX = 5.2;

// the longest contour in the name, with a little margin for antialiasing
const dashEm = (text: string) =>
  1.03 * Math.max(...Array.from(text, c => GLYPH_EM[c] ?? GLYPH_EM_MAX));

export default function ProductHeroReveal({ src, alt, title }: { src: string; alt: string; title: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<StoneLight | null>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const lineRef = useRef<SVGTextElement>(null);
  const [loaded, setLoaded] = useState(false);
  const maskId = `phero-${useId().replace(/:/g, "")}`;

  // cached images can finish before onLoad is wired up
  useEffect(() => {
    if (baseRef.current?.complete) setLoaded(true);
  }, [src]);

  // size the cut-out name to the frame, whatever the product is called
  useEffect(() => {
    const root = rootRef.current, text = textRef.current;
    if (!root || !text) return;
    const fit = () => {
      const w = root.clientWidth, h = root.clientHeight;
      if (!w || !h) return;
      text.style.fontSize = "100px";
      const len = text.getComputedTextLength();
      if (!len) return;
      const size = Math.max(12, Math.min((w * 0.84 / len) * 100, h * 0.3));
      text.style.fontSize = `${size}px`;
      const line = lineRef.current;
      if (line) {
        line.style.fontSize = `${size}px`;
        const dash = size * dashEm(line.textContent ?? "");
        line.style.strokeDasharray = `${dash}`;
        line.style.strokeWidth = `${Math.max(1, size * 0.011)}`;
        // keep whatever the timeline has already played
        if (!line.dataset.drawn) line.style.strokeDashoffset = `${dash}`;
        // only shown once it has a dash long enough to hide it, so a slow font
        // load can never flash the finished outline over the frame
        line.style.visibility = "visible";
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [title]);

  // GPU light pass. Kept out of the timeline effect so a re-run of the timeline
  // never costs a texture upload. "off" means no WebGL: the <img> carries the
  // frame and the sequence skips straight to the name reveal.
  const [gl, setGl] = useState<"pending" | "ready" | "off">("pending");
  useEffect(() => {
    if (!canvasRef.current) return;
    setGl("pending");
    let light: StoneLight | null = null;
    let ro: ResizeObserver | null = null;
    let cancelled = false;
    // three.js is a large dependency and only product pages ever draw a hero,
    // so it is split out and fetched here rather than shipped in the main bundle
    loadStoneLight()
      .then(({ createStoneLight }) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        light = createStoneLight(canvas, src, () => setGl("ready"));
        lightRef.current = light;
        if (!light) { setGl("off"); return; }
        const l = light;
        ro = new ResizeObserver(() => l.resize());
        ro.observe(canvas);
      })
      .catch(() => { if (!cancelled) setGl("off"); });
    return () => {
      cancelled = true;
      ro?.disconnect();
      light?.dispose();
      lightRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    // wait for the light pass to resolve either way, so the timeline is built
    // once and never restarts underneath the viewer
    if (!loaded || gl === "pending") return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      // sine is the gentlest of the built-ins — no visible kick at either end,
      // which is what sells the light as drifting rather than being swiped
      const ease = "sine.inOut";

      // one uniform carries the whole light pass; the shader does the rest
      const sweep = { p: 0 };
      tl.fromTo(sweep, { p: 0 }, {
        p: 1, duration: SWEEP, ease,
        onUpdate: () => lightRef.current?.setProgress(sweep.p),
      }, HOLD);

      // the outline forms over the dark slab, and only then does the white arrive
      const lineAt = HOLD + SWEEP + GAP - OVERLAP;
      tl.to(lineRef.current, { strokeDashoffset: 0, duration: LINE, ease: "sine.inOut" }, lineAt)
        .set(lineRef.current, { onComplete: () => { if (lineRef.current) lineRef.current.dataset.drawn = "1"; } }, lineAt + LINE);

      // The outline may now start well inside the sweep, so the white has to be
      // held back explicitly: it must never begin rising while the light is
      // still crossing, whatever SWEEP and OVERLAP are set to.
      const washAt = Math.max(lineAt + LINE, HOLD + SWEEP);
      // The white rises in place rather than travelling, so the colour under it
      // has to come back evenly too — a positional reveal would show its own
      // edge crossing the letters, which are the one place you can see through.
      const reveal = { p: 0 };
      tl.fromTo(reveal, { p: 0 }, {
        p: 1, duration: WASH, ease: "power2.inOut",
        onUpdate: () => lightRef.current?.setReveal(reveal.p),
      }, washAt)
        .to(washRef.current, { opacity: 1, duration: WASH, ease: "power2.inOut" }, washAt)
        // the outline hands over to the filled letters as the white comes up
        .to(lineRef.current, { opacity: 0, duration: WASH * 0.6, ease: "power2.in" }, washAt + WASH * 0.15);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        lightRef.current?.setProgress(1);
        lightRef.current?.setReveal(1);
        tl.progress(1).pause();
        if (lineRef.current) lineRef.current.dataset.drawn = "1";
        return;
      }

      // once per mount: plays on the first pass through the viewport and then
      // stops watching, so scrolling back to it does not replay
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        tl.play();
      }, { threshold: 0.35 });
      io.observe(root);
      return () => io.disconnect();
    }, root);

    return () => ctx.revert();
  }, [loaded, src, gl]);

  return (
    <div className="phero" ref={rootRef}>
      <img
        className="phero__base"
        ref={baseRef}
        src={src}
        alt={alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />

      {/* the light pass; hidden until its texture is up, so the <img> shows through */}
      <canvas
        className="phero__gl"
        ref={canvasRef}
        aria-hidden="true"
        style={{ opacity: gl === "ready" ? 1 : 0 }}
      />

      {/* the name in outline, on its own layer so it can be seen before the wash */}
      <svg className="phero__lineart" width="100%" height="100%" aria-hidden="true">
        <text ref={lineRef} className="phero__cut phero__line" x="50%" y="50%" dy="0.35em" textAnchor="middle" style={{ visibility: "hidden" }}>
          {title.toUpperCase()}
        </text>
      </svg>

      {/* white wash with the product name punched through it */}
      <div className="phero__wash" ref={washRef} aria-hidden="true">
        <svg className="phero__svg" width="100%" height="100%">
            <defs>
              <mask id={maskId}>
                <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
                <text ref={textRef} className="phero__cut" x="50%" y="50%" dy="0.35em" textAnchor="middle" fill="#000">
                  {title.toUpperCase()}
                </text>
              </mask>
            </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="#fff" mask={`url(#${maskId})`} />
        </svg>
      </div>
    </div>
  );
}
