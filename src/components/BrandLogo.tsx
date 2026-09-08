type BrandLogoProps = {
  className?: string;
  title?: string;
};

export function BrandLogo({
  className = 'h-9 w-9',
  title = 'English Study',
}: BrandLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brand-logo-bg" x1="8" y1="6" x2="42" y2="44">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="brand-logo-accent" x1="17" y1="9" x2="34" y2="37">
          <stop stopColor="#ff6b57" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#brand-logo-bg)" />
      <path
        d="M11.5 17.2c4.9-.8 9.2.1 12.5 2.7v18.5c-3.3-2.9-7.5-4.1-12.5-3.4V17.2Z"
        fill="#eef2ff"
      />
      <path
        d="M36.5 17.2c-4.9-.8-9.2.1-12.5 2.7v18.5c3.3-2.9 7.5-4.1 12.5-3.4V17.2Z"
        fill="#eef2ff"
      />
      <path
        d="M15.2 22.5c3.6-.1 6.5 1.2 8.8 3.8 2.3-2.6 5.2-3.9 8.8-3.8"
        fill="none"
        stroke="#c7d2fe"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M17.6 13.2c3.7-1.3 7.2.2 8.9 3.5 1.4 2.8.8 5.4-1.2 8.1-1.3 1.8-1.6 3.6-1.3 6.1-3.2-2.5-6.3-5-7.8-8.7-1.2-3.1-.8-6.6 1.4-9Z"
        fill="url(#brand-logo-accent)"
      />
      <circle cx="29.7" cy="13.6" r="4.1" fill="url(#brand-logo-accent)" />
      <path
        d="M13.4 37.1c4.4-.6 8 .3 10.6 2.7 2.6-2.4 6.2-3.3 10.6-2.7"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}
