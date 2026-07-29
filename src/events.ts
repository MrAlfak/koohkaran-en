export type Event = {
  id: number;
  cat: string;
  title: string;
  excerpt: string;
  date: string;
  location: string;
  image: string;
  heroImage: string;
  body: string[];
};

export const EVENTS: Event[] = [
  {
    id: 0,
    cat: "Exhibitions",
    title: "Stone & Surface Tehran 2026",
    excerpt: "Discover our latest marble and granite collections at Iran's premier stone exhibition.",
    date: "MAR 12 – 15, 2026",
    location: "Tehran International Fairground",
    image: "images/journal_img_0.jpg",
    heroImage: "images/injournal_img_0.jpg",
    body: [
      "Koohkaran returns to Stone & Surface Tehran with a curated selection of premium natural stone slabs — from dramatic onyx to refined travertine.",
      "Visit our pavilion to explore full-scale slab displays, meet our material specialists, and discuss sourcing for residential and commercial projects.",
      "Exclusive preview pieces from our 2026 collection will be available for the first time at this event.",
    ],
  },
  {
    id: 1,
    cat: "Launches",
    title: "Black Tempest Collection Launch",
    excerpt: "An evening unveiling of our most dramatic marble series, paired with architectural presentations.",
    date: "APR 8, 2026",
    location: "Koohkaran Showroom, Muscat",
    image: "images/journal_img_3.jpg",
    heroImage: "images/injournal_img_1.jpg",
    body: [
      "Join us for an intimate launch event celebrating Black Tempest — a leathered marble with depth, movement, and architectural presence.",
      "The evening includes a guided tour of the collection, live slab viewing, and conversations with designers who have specified the material in recent projects.",
      "Light refreshments will be served. RSVP recommended for planning purposes.",
    ],
  },
  {
    id: 2,
    cat: "Workshops",
    title: "Material Selection for Architects",
    excerpt: "A hands-on workshop on specifying natural stone for high-end residential and hospitality projects.",
    date: "MAY 22, 2026",
    location: "Koohkaran Studio, Shiraz",
    image: "images/journal_img_5.jpg",
    heroImage: "images/injournal_img_2.jpg",
    body: [
      "This workshop is designed for architects and interior designers who specify stone in luxury environments.",
      "Topics include slab grading, finish options, vein matching, logistics planning, and coordination with fabricators.",
      "Participants will work with real material samples and receive a specification guide prepared by the Koohkaran technical team.",
    ],
  },
  {
    id: 3,
    cat: "Fairs",
    title: "Design Week Oman — Stone Pavilion",
    excerpt: "Collaborative showcase with leading Omani architects featuring Koohkaran slabs in live installations.",
    date: "JUN 5 – 11, 2026",
    location: "Muscat Design District",
    image: "images/journal_img_8.jpg",
    heroImage: "images/injournal_img_3.jpg",
    body: [
      "During Design Week Oman, Koohkaran partners with three regional studios to present stone as a living design medium.",
      "Installations span indoor feature walls, outdoor cladding mock-ups, and custom countertop compositions.",
      "Our team will be on site daily for consultations, sample requests, and project inquiries.",
    ],
  },
  {
    id: 4,
    cat: "Exhibitions",
    title: "Milan Stone Preview",
    excerpt: "International preview of Iranian premium slabs for European specification teams.",
    date: "SEP 18 – 20, 2026",
    location: "Milan, Italy",
    image: "images/journal_img_10.jpg",
    heroImage: "images/injournal_img_4.jpg",
    body: [
      "Koohkaran presents a focused edit of Iranian stone for European architects and developers seeking distinctive, durable surfaces.",
      "The preview includes technical documentation, sustainability notes, and logistics support for international procurement.",
      "Private appointments are available throughout the three-day program.",
    ],
  },
  {
    id: 5,
    cat: "Announcements",
    title: "New Showroom Opening — Dubai",
    excerpt: "Expanding our regional presence with a dedicated slab gallery in the UAE.",
    date: "OCT 3, 2026",
    location: "Dubai Design District",
    image: "images/journal_img_11.jpg",
    heroImage: "images/injournal_img_5.jpg",
    body: [
      "We are pleased to announce the opening of our Dubai showroom — a dedicated space for architects, contractors, and private clients across the GCC.",
      "The gallery will house rotating collections of marble, granite, onyx, and semi-precious stone, with on-site consultation services.",
      "Opening day includes guided tours, material talks, and a welcome reception for industry partners.",
    ],
  },
];

export function getEvent(id: number): Event {
  return EVENTS.find(e => e.id === id) ?? EVENTS[0];
}
