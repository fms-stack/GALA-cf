export function Logo({ size = 40, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Cook & Food Gala"
    >
      {/* Outer wavy ring, open at bottom (sound-wave style) */}
      <path d="M40 110 C42 60, 80 32, 110 32 C150 32, 175 70, 173 110 C171 140, 155 162, 130 168 C115 172, 95 172, 80 168 C60 162, 45 145, 40 110 Z" />
      {/* 2nd ring */}
      <path d="M55 110 C57 75, 88 50, 112 50 C142 50, 162 78, 160 110 C158 134, 145 152, 125 156 C112 159, 96 159, 84 156 C68 152, 58 138, 55 110 Z" />
      {/* 3rd ring */}
      <path d="M70 110 C72 88, 95 70, 113 70 C133 70, 148 88, 147 110 C146 127, 137 140, 122 143 C111 145, 100 145, 90 143 C78 140, 72 128, 70 110 Z" />
      {/* 4th ring */}
      <path d="M85 110 C86 96, 102 88, 113 88 C125 88, 134 98, 133 110 C133 120, 127 128, 118 130 C110 131, 102 131, 95 130 C88 128, 85 121, 85 110 Z" />
      {/* central dot */}
      <circle cx="110" cy="110" r="6" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Logo size={56} />
      <div className="mt-4 serif-display text-2xl tracking-wide">COOK &amp; FOOD</div>
      <div className="text-[10px] tracking-[0.45em] mt-1 opacity-80">GALA</div>
    </div>
  );
}
