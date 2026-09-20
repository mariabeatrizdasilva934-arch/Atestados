interface KatoenNatieLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  className?: string;
  imgClassName?: string;
}

export function KatoenNatieLogo({
  variant = 'full',
  className = '',
  imgClassName = ''
}: KatoenNatieLogoProps) {
  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/katoen-natie.png"
          alt="Katoen Natie"
          className={`object-contain ${imgClassName || 'h-16 w-auto'}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/katoen-natie-symbol.svg"
          alt="Katoen Natie Simbolo"
          className={`object-contain ${imgClassName || 'w-8 h-8'}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Horizontal variant (symbol + brand typography)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/katoen-natie-symbol.svg"
        alt="Katoen Natie"
        className={`object-contain shrink-0 ${imgClassName || 'w-7 h-7'}`}
        referrerPolicy="no-referrer"
      />
      <span className="font-extrabold tracking-tight text-slate-950 uppercase text-base leading-none">
        Katoen Natie
      </span>
    </div>
  );
}
