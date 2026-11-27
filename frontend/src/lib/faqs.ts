// Frequently asked questions, shown on /faqs and /how-to-order.
//
// To edit: change the text below. Each answer is a list of paragraphs.
// `id` is the link anchor (/faqs#id) — keep it short, lowercase, with dashes.
//
// Only write what we know is true. Do not add minimum orders, prices,
// delivery fees, delivery times, discounts or certifications here.

import { site } from "./site";

export type Faq = {
  id: string;
  question: string;
  answer: string[];
};

export const faqs: Faq[] = [
  {
    id: "products",
    question: "What products do you sell?",
    answer: [
      "We sell four Luna Soft products: Luna Soft Pads 290mm, Luna Soft Pads 240mm, Adult Diapers XL and Adult Pants XL.",
    ],
  },
  {
    id: "pack-sizes",
    question: "How are the products packed?",
    answer: [
      "Pads 290mm and 240mm: 1 bale = 5 polybags × 10 pieces = 50 pieces.",
      "Adult Diapers XL and Adult Pants XL: 1 bale = 10 pieces.",
    ],
  },
  {
    id: "who-can-order",
    question: "Who can order from you?",
    answer: ["We supply wholesalers and retailers."],
  },
  {
    id: "how-to-order",
    question: "How do I place an order?",
    answer: [
      `Talk to our sales team on WhatsApp, by phone on ${site.phone.display}, or by email at ${site.email}. Tell us the products and how many bales you need.`,
      "We confirm your order and send you an invoice. Then you collect the goods, or we deliver them to you.",
    ],
  },
  {
    id: "prices",
    question: "What are your prices?",
    answer: [
      "Contact our sales team for wholesale and retail prices.",
    ],
  },
  {
    id: "payment",
    question: "How do I pay?",
    answer: [
      "Our sales team will give you the invoice and payment details when you place your order.",
    ],
  },
  {
    id: "collect-or-delivery",
    question: "Can I collect my order, or do you deliver?",
    answer: [
      "Both. You can collect your order from us, or we deliver it to you. Agree which one with our sales team when you order.",
    ],
  },
  {
    id: "receipts",
    question: "Will I get a receipt and a delivery note?",
    answer: [
      "Yes. You get a receipt for your payment and a delivery note with your goods.",
    ],
  },
  {
    id: "location",
    question: "Where are you?",
    answer: [`We are at ${site.location}.`],
  },
];
