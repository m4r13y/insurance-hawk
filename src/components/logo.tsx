interface LogoProps {
  className?: string;
  altLogo?: boolean;
}

export function Logo({ className, altLogo = false }: LogoProps) {
  return (
    <img
      src={altLogo ? "/logo-alt.svg" : "/logo.svg"}
      alt={altLogo ? "Insurance Hawk Alt Logo" : "Insurance Hawk Logo"}
      className={`h-14 w-auto ${className || ''}`}
    />
  );
}