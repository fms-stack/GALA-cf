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
      {/* Ring 1 — outermost, top half circular, bottom 3-wave scallop */}
      <path d="M 100 28
               C 145 28, 178 60, 178 100
               C 178 122, 170 138, 160 148
               Q 152 158, 145 152
               Q 138 145, 130 152
               Q 122 162, 115 154
               Q 108 145, 100 154
               Q 92 145, 85 154
               Q 78 162, 70 152
               Q 62 145, 55 152
               Q 48 158, 40 148
               C 30 138, 22 122, 22 100
               C 22 60, 55 28, 100 28 Z" />
      {/* Ring 2 */}
      <path d="M 100 46
               C 134 46, 160 70, 160 100
               C 160 116, 154 128, 146 136
               Q 140 142, 134 137
               Q 128 130, 122 137
               Q 116 145, 110 138
               Q 104 130, 100 138
               Q 96 130, 90 138
               Q 84 145, 78 137
               Q 72 130, 66 137
               Q 60 142, 54 136
               C 46 128, 40 116, 40 100
               C 40 70, 66 46, 100 46 Z" />
      {/* Ring 3 */}
      <path d="M 100 62
               C 124 62, 142 78, 142 100
               C 142 112, 138 120, 132 126
               Q 128 130, 124 126
               Q 120 121, 116 126
               Q 112 132, 108 127
               Q 104 122, 100 127
               Q 96 122, 92 127
               Q 88 132, 84 126
               Q 80 121, 76 126
               Q 72 130, 68 126
               C 62 120, 58 112, 58 100
               C 58 78, 76 62, 100 62 Z" />
      {/* Ring 4 — innermost */}
      <path d="M 100 78
               C 113 78, 122 87, 122 100
               C 122 108, 119 113, 115 117
               Q 112 120, 109 117
               Q 106 114, 103 117
               Q 100 121, 97 117
               Q 94 114, 91 117
               Q 88 120, 85 117
               C 81 113, 78 108, 78 100
               C 78 87, 87 78, 100 78 Z" />
      {/* Center dot */}
      <circle cx="100" cy="100" r="6.5" fill="currentColor" />
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
