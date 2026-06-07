export function Logo({ size = 40, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-label="Cook & Food Gala"
    >
      <path d="M50 32 C61 30, 70 39, 69 50 C68 61, 58 70, 50 69 C39 68, 30 58, 31 50 C32 39, 42 33, 50 32 Z" />
      <path d="M50 22 C67 19, 81 33, 79 50 C77 67, 62 81, 50 79 C33 77, 19 62, 21 50 C23 33, 38 24, 50 22 Z" />
      <path d="M50 13 C73 9, 91 27, 89 50 C87 73, 67 91, 50 89 C27 87, 9 67, 11 50 C13 27, 31 15, 50 13 Z" />
      <path d="M50 4 C80 2, 98 20, 97 50 C96 80, 78 98, 50 97 C20 96, 2 78, 3 50 C4 20, 28 6, 50 4 Z" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Logo size={48} />
      <div className="mt-3 serif-display text-2xl tracking-wide">COOK &amp; FOOD</div>
      <div className="text-[10px] tracking-[0.45em] mt-1 opacity-80">GALA</div>
    </div>
  );
}
