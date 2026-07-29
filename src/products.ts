export const PRODUCT_CATEGORIES = [
  "Granite",
  "Marble",
  "Onyx",
  "Travertine",
  "Quartzite",
  "Semi Precious",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: number;
  code: string;
  name: string;
  cat: string;
  size: string;
  image: string;
  heroImage: string;
  detailImage: string;
  finish: string;
  origin: string;
  colors: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 0,
    code: "KK-M-101",
    name: "Algae Hard",
    cat: "Marble",
    size: "322 × 180",
    image: "images/prod_img_0.jpg",
    heroImage: "images/inprod_img_0.jpg",
    detailImage: "images/inprod_img_1.jpg",
    finish: "Polish",
    origin: "Iranian",
    colors: "Green, White",
  },
  {
    id: 1,
    code: "KK-M-102",
    name: "Algae cotton",
    cat: "Marble",
    size: "320 × 175",
    image: "images/prod_img_1.jpg",
    heroImage: "images/inprod_img_1.jpg",
    detailImage: "images/inprod_img_2.jpg",
    finish: "Honed",
    origin: "Iranian",
    colors: "Cream, Green",
  },
  {
    id: 2,
    code: "KK-M-103",
    name: "Cream Rock Marble",
    cat: "Travertine",
    size: "225 × 190",
    image: "images/prod_img_2.jpg",
    heroImage: "images/inprod_img_2.jpg",
    detailImage: "images/inprod_img_3.jpg",
    finish: "Polish",
    origin: "Iranian",
    colors: "Cream, Beige",
  },
  {
    id: 3,
    code: "KK-G-201",
    name: "Crystal Diamond Silk Rock",
    cat: "Granite",
    size: "270 × 175",
    image: "images/prod_img_3.jpg",
    heroImage: "images/inprod_img_3.jpg",
    detailImage: "images/inprod_img_4.jpg",
    finish: "Silk",
    origin: "Iranian",
    colors: "Grey, White",
  },
  {
    id: 4,
    code: "KK-M-104",
    name: "Crystal Deja Vu Rock",
    cat: "Marble",
    size: "280 × 175",
    image: "images/prod_img_4.jpg",
    heroImage: "images/inprod_img_4.jpg",
    detailImage: "images/inprod_img_5.jpg",
    finish: "Polish",
    origin: "Iranian",
    colors: "Grey, Black",
  },
  {
    id: 5,
    code: "KK-M-105",
    name: "Black Beauty Lineal",
    cat: "Onyx",
    size: "290 × 190",
    image: "images/prod_img_5.jpg",
    heroImage: "images/inprod_img_5.jpg",
    detailImage: "images/inprod_img_0.jpg",
    finish: "Lineal",
    origin: "Iranian",
    colors: "Black, Gold",
  },
  {
    id: 6,
    code: "KK-M-106",
    name: "Black Tempest Leathered",
    cat: "Quartzite",
    size: "325 × 195",
    image: "images/prod_img_6.jpg",
    heroImage: "images/inprod_img_1.jpg",
    detailImage: "images/inprod_img_2.jpg",
    finish: "Leathered",
    origin: "Iranian",
    colors: "Black, Grey",
  },
  {
    id: 7,
    code: "KK-M-107",
    name: "Black Horse Rock",
    cat: "Semi Precious",
    size: "330 × 190",
    image: "images/prod_img_7.jpg",
    heroImage: "images/inprod_img_2.jpg",
    detailImage: "images/inprod_img_3.jpg",
    finish: "Rock",
    origin: "Iranian",
    colors: "Black, Brown",
  },
];

export function getProduct(id: number): Product {
  return PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0];
}
