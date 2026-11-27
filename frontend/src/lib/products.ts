// The public product range. Pack sizes here are the trade facts buyers order by;
// prices are deliberately absent (buyers ask the sales team).

export type PublicProduct = {
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  /** Pack-front photos shot in a room are cropped closer to the pack. */
  photo?: { zoom: number; focus: string };
  /** Short features, as printed on the pack. */
  features: string[];
  /** One bale, written out in full. */
  bale: string;
  baleTotal: string;
};

export const products: PublicProduct[] = [
  {
    slug: "pads-290",
    name: "Luna Soft Pads 290mm",
    image: "/images/LS-PAD-290.jpg",
    imageAlt: "A pack of Luna Soft 290mm sanitary pads",
    photo: { zoom: 1.7, focus: "50% 45%" },
    features: ["Ultra soft", "Leak protection", "Breathable comfort"],
    bale: "5 polybags × 10 pieces",
    baleTotal: "50 pieces",
  },
  {
    slug: "pads-240",
    name: "Luna Soft Pads 240mm",
    image: "/images/LS-PAD-240.jpg",
    imageAlt: "A pack of Luna Soft 240mm sanitary pads",
    photo: { zoom: 1.7, focus: "50% 45%" },
    features: ["Ultra soft", "Leak protection", "Breathable comfort"],
    bale: "5 polybags × 10 pieces",
    baleTotal: "50 pieces",
  },
  {
    slug: "adult-diapers-xl",
    name: "Adult Diapers XL",
    image: "/images/LS-ADT-L(2).png",
    imageAlt: "Three packs of Luna Soft Adult Tape Diapers, size XL",
    features: ["Super absorbent", "Leak protection", "Skin friendly"],
    bale: "10 pieces",
    baleTotal: "10 pieces",
  },
  {
    slug: "adult-pants-xl",
    name: "Adult Pants XL",
    image: "/images/LS-ADP-XL(2).png",
    imageAlt: "Front and back of a pack of Luna Soft Adult Pants, size XL",
    features: ["Flexible fit", "Discreet comfort"],
    bale: "10 pieces",
    baleTotal: "10 pieces",
  },
];

// How a trade order works, used on Home and How to order.
export const orderSteps = [
  {
    title: "Talk to our sales team",
    text: "Message us on WhatsApp, call or email. Tell us which products you need and how many bales.",
  },
  {
    title: "We confirm and send an invoice",
    text: "Our sales team confirms your order and sends you an invoice.",
  },
  {
    title: "Collect, or we deliver",
    text: "Collect your order from us, or we deliver it to you. You get a receipt for your payment and a delivery note with your goods.",
  },
];
