export const SITE_NAME = "Koohkaran";
export const SITE_TAGLINE = "Premium Natural Stone Slabs";
const DEFAULT_DESCRIPTION =
  "Koohkaran supplies curated premium natural stone slabs — granite, marble, onyx, travertine, quartzite, and semi-precious stone for luxury architecture and interior design.";
const DEFAULT_KEYWORDS =
  "natural stone slabs, granite slabs, marble slabs, onyx, travertine, quartzite, stone supplier, koohkaran, slab market, luxury stone";

export type SeoPage =
  | "home"
  | "contact"
  | "about"
  | "journal"
  | "article"
  | "products"
  | "product"
  | "events"
  | "event";

const PAGE_SEO: Record<SeoPage, { title: string; description: string }> = {
  home: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  about: {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Learn about Koohkaran — sourcing and curating premium natural stone slabs with expert consultation for architects, designers, and discerning clients.",
  },
  products: {
    title: `Stone Products & Slabs | ${SITE_NAME}`,
    description:
      "Browse our collection of granite, marble, onyx, travertine, quartzite, and semi-precious stone slabs. Filter by stone type and explore specifications.",
  },
  product: {
    title: `Product Details | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
  },
  journal: {
    title: `Journal | ${SITE_NAME}`,
    description:
      "Stone stories, design insights, and industry updates from Koohkaran — inspiration for architects and interior designers.",
  },
  article: {
    title: `Article | ${SITE_NAME} Journal`,
    description:
      "Read design insights and stone stories from the Koohkaran journal.",
  },
  events: {
    title: `Events & Exhibitions | ${SITE_NAME}`,
    description:
      "Upcoming stone exhibitions, collection launches, workshops, and industry events from Koohkaran.",
  },
  event: {
    title: `Event Details | ${SITE_NAME}`,
    description:
      "Event details, dates, and registration information from Koohkaran.",
  },
  contact: {
    title: `Contact Us | ${SITE_NAME}`,
    description:
      "Get in touch with Koohkaran for stone consultation, slab selection, and project inquiries. Call 09173090000 or email info@koohkaran.com.",
  },
};

function siteOrigin(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, "") + "/";
  }
  return "https://koohkaranstone.com/";
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

export function updatePageSeo(
  page: SeoPage,
  options?: { title?: string; description?: string },
) {
  const base = PAGE_SEO[page];
  const title = options?.title ?? base.title;
  const description = options?.description ?? base.description;
  const url = typeof window !== "undefined" ? window.location.href : siteOrigin();
  const image = `${siteOrigin()}images/logo.png`;

  document.title = title;

  setMeta("name", "description", description);
  setMeta("name", "keywords", DEFAULT_KEYWORDS);
  setMeta("name", "robots", "index, follow");
  setMeta("name", "author", SITE_NAME);

  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", SITE_NAME);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", image);
  setMeta("property", "og:locale", "en_US");

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  setCanonical(url);
}
