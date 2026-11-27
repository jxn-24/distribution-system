import Image from "next/image";
import type { PublicProduct } from "@/lib/products";

// A product shot on a white tile. Room photos (the pads) are cropped in on the pack.
export default function ProductImage({
  product,
  sizes,
  className = "aspect-[4/3]",
}: {
  product: PublicProduct;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white ring-1 ring-inset ring-neutral-200 ${className}`}>
      <Image
        src={product.image}
        alt={product.imageAlt}
        fill
        sizes={sizes}
        className={product.photo ? "object-cover" : "object-contain p-3"}
        style={
          product.photo
            ? {
                objectPosition: product.photo.focus,
                transform: `scale(${product.photo.zoom})`,
                transformOrigin: product.photo.focus,
              }
            : undefined
        }
      />
    </div>
  );
}
