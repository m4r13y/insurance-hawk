interface LogoProps {
  className?: string;
  altLogo?: boolean;
  darkSwap?: boolean; // show white logo in dark theme
  size?: number; // explicit pixel height (defaults to 56)
}

// Tune these as needed. Aspect ratio derived from current asset (width / height).
const DEFAULT_SIZE = 56; // h-14 baseline elsewhere in design system
const ASPECT_RATIO = 224 / 56; // == 4; adjust if the artwork changes

export function Logo({ className, altLogo = false, darkSwap = true, size }: LogoProps) {
  const h = size ?? DEFAULT_SIZE;
  const w = Math.round(h * ASPECT_RATIO);
  const base = altLogo ? '/logo-alt.svg' : '/logo.svg';
  const dark = '/white-insurance-hawk-logo.png';

  // Tailwind JIT cannot see dynamic arbitrary classes like h-[${h}px].
  // We instead size a wrapper element explicitly and let the images fill it.
  const containerClass = `relative inline-block select-none shrink-0 ${className || ''}`;
  const commonImgClass = 'block h-full w-auto';

  if (!darkSwap) {
    return (
      <span className={containerClass} style={{ height: h, width: w }}>
        <img
          src={base}
          alt="Insurance Hawk Logo"
          width={w}
          height={h}
          className={commonImgClass}
          decoding="async"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span className={containerClass} style={{ height: h, width: w }}>
      <img
        src={base}
        alt="Insurance Hawk Logo"
        width={w}
        height={h}
        className={`${commonImgClass} dark:hidden`}
        decoding="async"
        loading="lazy"
      />
      <img
        src={dark}
        alt="Insurance Hawk Logo (white)"
        width={w}
        height={h}
        className={`${commonImgClass} hidden dark:block`}
        decoding="async"
        loading="lazy"
      />
    </span>
  );
}
