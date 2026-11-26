import Image from "next/image";

// The original Luna Soft logo is a 1254×1254 square with wide black margins and a
// small tagline under the wordmark. At header sizes the whole square would shrink the
// mark to a few pixels, so this crops to the crescent + "LunaSoft" wordmark only.
const SOURCE = 1254;
const CROP = { x: 90, y: 250, width: 1102, height: 556 };

// No transparent version of the full logo exists, so it is shown as a deliberate black
// tile: rounded corners, a hairline edge, and a little padding so the crescent never
// touches the corners. The tile's black matches the JPEG's own background.
export default function BrandLogo({
  height,
  alt = "Luna Soft Essentials",
  preload = false,
  className = "",
}: {
  /** Height of the artwork in CSS pixels; the tile adds padding around it. The width follows from the crop. */
  height: number;
  alt?: string;
  preload?: boolean;
  className?: string;
}) {
  const scale = height / CROP.height;
  const size = Math.round(SOURCE * scale);
  const padding = Math.round(height * 0.14);

  return (
    <span
      className={`block shrink-0 rounded-xl bg-black ring-1 ring-white/10 ${className}`}
      style={{ padding }}
    >
      <span
        className="relative block overflow-hidden"
        style={{ width: Math.round(CROP.width * scale), height }}
      >
        <Image
          src="/images/Luna_Soft_Essentials_logo.jpeg"
          alt={alt}
          width={size}
          height={size}
          preload={preload}
          loading={preload ? undefined : "eager"}
          className="absolute max-w-none"
          style={{
            width: size,
            height: size,
            left: -Math.round(CROP.x * scale),
            top: -Math.round(CROP.y * scale),
          }}
        />
      </span>
    </span>
  );
}
