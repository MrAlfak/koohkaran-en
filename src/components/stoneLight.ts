import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

/*
  The light pass, on the GPU.

  A CSS gradient can only change a pixel's exposure. It has no idea the stone
  has relief, so a "highlight" is just a paler rectangle. Here the shader reads
  the photograph's own luminance gradient as a normal map, then runs real
  diffuse + specular shading against a light that rakes across the slab. The
  polished veins catch the light and release it as the band moves on, which is
  the part that reads as genuinely lit rather than merely brightened.

  Two properties are load-bearing and worth keeping if this is ever edited:
  behind the light the shader must output the untouched photograph exactly (the
  product name is cut out of the settled frame, so any drift would show), and
  all shading happens in linear space with sRGB in/out, so the unlit pixels
  round-trip to precisely their original values.
*/

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D uTex;
uniform vec2  uTexel;    // one texel, in texture uv
uniform vec2  uCover;    // object-fit: cover mapping
uniform vec2  uOffset;
uniform float uProgress; // 0 = light off frame left, 1 = off frame right
uniform float uRelief;
uniform float uShine;
uniform float uCrisp;
uniform vec3  uWarm;     // colour of the light itself
uniform vec3  uCool;     // colour the shade falls to
uniform float uLift;
uniform float uSpec;
uniform float uShade;
uniform float uReveal;

varying vec2 vUv;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

// A raw ShaderMaterial writes gl_FragColor untouched, so renderer.outputColorSpace
// never gets a chance to act. The texture is flagged sRGB and therefore arrives
// already linearised, which is what we want for the shading maths — but it has to
// be encoded back by hand or every pixel ships far too dark.
vec3 toSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 uv = vUv * uCover + uOffset;
  vec3 base = texture2D(uTex, uv).rgb;

  // neighbours, used twice: once for relief, once for local contrast
  float lC = luma(base);
  float lR = luma(texture2D(uTex, uv + vec2(uTexel.x, 0.0)).rgb);
  float lL = luma(texture2D(uTex, uv - vec2(uTexel.x, 0.0)).rgb);
  float lD = luma(texture2D(uTex, uv + vec2(0.0, uTexel.y)).rgb);
  float lU = luma(texture2D(uTex, uv - vec2(0.0, uTexel.y)).rgb);

  // relief straight from the photograph: how fast its brightness changes is a
  // good stand-in for how the surface actually turns
  vec3 N = normalize(vec3(-(lR - lL) * uRelief, -(lD - lU) * uRelief, 1.0));

  // sweep axis, leaned over so the light rakes rather than wipes.
  // the band must clear the frame at both ends: any residue left at progress 1
  // would mean the settled frame is not the untouched photograph, and the name
  // is cut out of exactly that frame
  float axis = vUv.x + (vUv.y - 0.5) * 0.14;
  float d = axis - mix(-1.05, 2.15, uProgress);

  // A gaussian has long tails, and those tails are the haze around the beam.
  // Cubing the falloff keeps a soft core but drops to nothing far sooner, which
  // reads as a band of light rather than a glow.
  float pool = exp(-pow(abs(d) / 0.19, 3.0));

  // The slab stays shaded for the whole pass — the light travels over it and
  // leaves it as it found it. Full colour returns evenly at the end, under the
  // white; an edge sweeping back would be visible through the cut-out letters,
  // which are the only place the slab is still showing by then.
  float revealed = uReveal;

  // the light swings as it crosses, so highlights travel over the relief
  // the source sits above the slab and slightly toward the sweep, so relief
  // catches it the way overhead light falls on stone
  vec3 L = normalize(vec3(clamp(-d, -1.0, 1.0) * 1.05, -0.58, 0.78));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));

  // polished, pale veins throw back more than the matt dark ground does
  float gloss = smoothstep(0.18, 0.85, lC);
  float spec = pow(max(dot(N, H), 0.0), uShine) * pool * mix(0.22, 1.0, gloss);

  // shade drifts cool so the warm light has something to read against — that
  // opposition is most of what makes a light look coloured rather than merely bright
  vec3 shaded = mix(vec3(lC), base, 0.88) * uShade * uCool;
  vec3 col = mix(shaded, base, revealed);

  // The gain is coloured and multiplicative. Multiplying keeps every ratio in
  // the texture intact, so the stone gets brighter and warmer without losing
  // contrast; adding a tint instead would lift the blacks and put a film over
  // it, which is the failure mode this whole layer exists to avoid.
  float fromAbove = mix(1.0, 0.9, vUv.y);
  col *= 1.0 + pool * uLift * uWarm * fromAbove;
  col += (lC - 0.25 * (lR + lL + lD + lU)) * pool * uCrisp;
  col = mix(vec3(luma(col)), col, 1.0 + pool * 0.34);
  col += spec * uSpec * uWarm * fromAbove;

  // roll the very top end off instead of clipping it flat, and only where the
  // light reaches, so unlit pixels pass through untouched
  col = max(col, vec3(0.0));
  col = mix(col, vec3(1.0) - exp(-col), smoothstep(0.45, 1.1, luma(col)) * pool);

  gl_FragColor = vec4(toSRGB(col), 1.0);
}
`;

export type StoneLight = {
  setProgress: (p: number) => void;
  setReveal: (p: number) => void;
  resize: () => void;
  dispose: () => void;
};

export function createStoneLight(canvas: HTMLCanvasElement, src: string, onReady: () => void): StoneLight | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null; // no WebGL — the plain <img> underneath carries the frame
  }
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTex: { value: null as Texture | null },
    uTexel: { value: new Vector2(1 / 1024, 1 / 1024) },
    uCover: { value: new Vector2(1, 1) },
    uOffset: { value: new Vector2(0, 0) },
    uProgress: { value: 0 },
    uRelief: { value: 2.6 },
    uShine: { value: 90 },
    uSpec: { value: 0.95 },
    uCrisp: { value: 2.2 },
    // Near-neutral daylight. The stone supplies the colour; tinting the lamp
    // any further just stains the greens, so uWarm stays close to white.
    uWarm: { value: new Vector3(1.0, 0.985, 0.955) },
    uCool: { value: new Vector3(0.98, 1.0, 1.03) },
    uLift: { value: 3.4 },
    // 0.62 in sRGB terms, expressed linearly (0.62 ^ 2.2)
    uShade: { value: 0.34 },
    uReveal: { value: 0 },
  };
  const mesh = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }));
  mesh.frustumCulled = false;
  scene.add(mesh);

  let tex: Texture | null = null;
  let raf = 0;
  let disposed = false;

  const draw = () => { if (!disposed) renderer.render(scene, camera); };

  const resize = () => {
    if (disposed) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    const img = tex?.image as HTMLImageElement | undefined;
    if (img?.naturalWidth) {
      const frame = w / h, photo = img.naturalWidth / img.naturalHeight;
      const sx = photo > frame ? frame / photo : 1;
      const sy = photo > frame ? 1 : photo / frame;
      uniforms.uCover.value.set(sx, sy);
      uniforms.uOffset.value.set((1 - sx) / 2, (1 - sy) / 2);
    }
    draw();
  };

  new TextureLoader().load(src, t => {
    if (disposed) { t.dispose(); return; }
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex = t;
    uniforms.uTex.value = t;
    const im = t.image as HTMLImageElement;
    uniforms.uTexel.value.set(1 / (im.naturalWidth || 1024), 1 / (im.naturalHeight || 1024));
    resize();
    onReady();
  });

  return {
    setProgress(p) {
      uniforms.uProgress.value = p;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); });
    },
    setReveal(p) {
      uniforms.uReveal.value = p;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); });
    },
    resize,
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      tex?.dispose();
      mesh.geometry.dispose();
      (mesh.material as ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
