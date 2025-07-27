import insurancehawklogo from '@/lib/images/insurancehawklogo.png';
export function Logo({className}: {className?: string}) {
  return (
    <img
      src={insurancehawklogo.src}
      alt="Insurance Hawk Logo"
      className={`h-14 w-auto ${className || ''}`}
    />
  );
}