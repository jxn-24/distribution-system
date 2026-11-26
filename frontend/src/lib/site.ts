// The one place for Luna Soft's public contact details. Every page reads from here,
// so a change to an address, number or profile only needs to be made once.

export const site = {
  name: "Luna Soft Essentials",
  email: "info@lunasoftessentials.co.ke",
  emailSubject: "Enquiry from the website",
  phone: {
    display: "+254 721 669 664",
    tel: "+254721669664",
  },
  location: "Utawala Complex, Eastern Bypass, Nairobi",
  directions: "https://www.google.com/maps/search/?api=1&query=Utawala+Complex+Eastern+Bypass+Nairobi",
  mapEmbed: "https://maps.google.com/maps?q=Utawala+Complex+Eastern+Bypass+Nairobi&output=embed",
  social: {
    whatsapp:
      "https://wa.me/254721669664?text=Hello%20Luna%20Soft%2C%20I%20would%20like%20to%20enquire%20about%20your%20products.",
    facebook: "https://www.facebook.com/share/1A3HkrEMB8/",
    tiktok: "https://www.tiktok.com/@lunasoftessentials",
    instagram: "https://www.instagram.com/lunasoftessentials",
  },
} as const;

export const mailtoHref = `mailto:${site.email}?subject=${encodeURIComponent(site.emailSubject)}`;
export const telHref = `tel:${site.phone.tel}`;

export type SocialNetwork = keyof typeof site.social;

// Display order and labels for the social links.
export const socialLinks: { network: SocialNetwork; label: string; href: string }[] = [
  { network: "instagram", label: "Instagram", href: site.social.instagram },
  { network: "facebook", label: "Facebook", href: site.social.facebook },
  { network: "tiktok", label: "TikTok", href: site.social.tiktok },
  { network: "whatsapp", label: "WhatsApp", href: site.social.whatsapp },
];
