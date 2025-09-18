interface LogoProps {
  className?: string;
  altLogo?: boolean;
  autoDark?: boolean; // apply lightening filters in dark mode
}

export function Logo({ className, altLogo = false, autoDark = false }: LogoProps) {
  return (
    <img
      src={altLogo ? "/logo-alt.svg" : "/logo.svg"}
      alt={altLogo ? "Insurance Hawk Alt Logo" : "Insurance Hawk Logo"}
  className={`h-14 w-auto ${autoDark ? 'dark:brightness-[1.35] dark:contrast-125 dark:saturate-125 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]' : ''} ${className || ''}`}
    />
  );
}
