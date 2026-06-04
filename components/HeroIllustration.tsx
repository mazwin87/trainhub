/* Teal line-art hero illustration: a magnifying glass discovering a verified
   trainer, surrounded by the roles a trainer can fill. Colours are driven by
   the design tokens so the art follows any future brand change. */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A magnifying glass focusing on a verified trainer, surrounded by the roles a trainer can fill: corporate trainer, workshop leader, consultant and keynote speaker."
    >
      <defs>
        <radialGradient id="hi-lens" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#F2FCFA" />
          <stop offset="100%" stopColor="#E2F6F1" />
        </radialGradient>
        <marker id="hi-ah" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
          <path d="M1 1L7 4.5L1 8" fill="none" stroke="var(--color-secondary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <clipPath id="hi-lensClip"><circle cx="250" cy="225" r="118" /></clipPath>
      </defs>

      {/* connector arrows */}
      <g stroke="var(--color-secondary)" strokeWidth="1.8" strokeDasharray="3 6" strokeLinecap="round" fill="none" opacity="0.7" markerEnd="url(#hi-ah)">
        <path d="M120 92 C 150 140, 165 160, 168 175" />
        <path d="M404 92 C 372 140, 352 160, 338 178" />
        <path d="M96 392 C 132 350, 150 332, 165 312" />
        <path d="M452 320 C 410 312, 372 308, 348 300" />
      </g>

      {/* role: Corporate Trainer (flipchart) */}
      <g>
        <rect x="40" y="44" width="46" height="46" rx="12" fill="var(--color-accent-light)" stroke="var(--color-accent)" strokeWidth="2" />
        <g stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(52,55)">
          <rect x="0" y="0" width="22" height="17" rx="2" /><path d="M3 13l4-5 3 3 5-7" /><path d="M11 17v6M6 23h10" />
        </g>
        <text x="40" y="108" fontFamily="var(--font-display)" fontSize="13.5" fontWeight="600" fill="var(--color-accent-text)">Corporate Trainer</text>
      </g>
      {/* role: Workshop Leader (presentation screen) */}
      <g>
        <rect x="372" y="44" width="46" height="46" rx="12" fill="var(--color-accent-light)" stroke="var(--color-accent)" strokeWidth="2" />
        <g stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(384,55)">
          <rect x="0" y="0" width="22" height="15" rx="2" /><path d="M11 15v5M7 24h8" /><circle cx="11" cy="7.5" r="3.4" />
        </g>
        <text x="372" y="108" fontFamily="var(--font-display)" fontSize="13.5" fontWeight="600" fill="var(--color-accent-text)">Workshop Leader</text>
      </g>
      {/* role: Consultant (tablet) */}
      <g>
        <rect x="42" y="400" width="46" height="46" rx="12" fill="var(--color-accent-light)" stroke="var(--color-accent)" strokeWidth="2" />
        <g stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(55,410)">
          <rect x="0" y="0" width="16" height="22" rx="3" /><path d="M5 5h6M5 9h6M5 13h4" />
        </g>
        <text x="38" y="464" fontFamily="var(--font-display)" fontSize="13.5" fontWeight="600" fill="var(--color-accent-text)">Consultant</text>
      </g>
      {/* role: Keynote Speaker (podium + mic) */}
      <g>
        <rect x="432" y="270" width="46" height="46" rx="12" fill="var(--color-accent-light)" stroke="var(--color-accent)" strokeWidth="2" />
        <g stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(445,280)">
          <path d="M3 22h16l-3-12H6L3 22Z" /><path d="M11 10V4" /><circle cx="11" cy="2.5" r="2.2" />
        </g>
        <text x="406" y="334" fontFamily="var(--font-display)" fontSize="13.5" fontWeight="600" fill="var(--color-accent-text)">Keynote Speaker</text>
      </g>

      {/* magnifier handle */}
      <line x1="338" y1="312" x2="446" y2="420" stroke="var(--color-accent-dark)" strokeWidth="20" strokeLinecap="round" />
      <line x1="338" y1="312" x2="446" y2="420" stroke="var(--color-accent)" strokeWidth="9" strokeLinecap="round" />
      <circle cx="330" cy="304" r="14" fill="#fff" stroke="var(--color-accent-dark)" strokeWidth="6" />

      {/* lens */}
      <circle cx="250" cy="225" r="118" fill="url(#hi-lens)" />
      <g clipPath="url(#hi-lensClip)">
        <ellipse cx="250" cy="332" rx="72" ry="11" fill="var(--color-accent)" opacity="0.06" />
        {/* trainer figure */}
        <g stroke="var(--color-accent)" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M222 178 C 214 142, 228 120, 250 120 C 272 120, 286 142, 278 178 C 274 160, 266 152, 260 152 L 240 152 C 232 152, 226 162, 222 178 Z" fill="var(--color-accent-light)" strokeWidth="3" />
          <circle cx="250" cy="168" r="23" fill="#fff" strokeWidth="3" />
          <path d="M243 165h0.4M257 165h0.4" strokeWidth="3.6" />
          <path d="M244 175c3.5 4 9 4 12.5 0" strokeWidth="2.4" />
          <path d="M229 160 C 234 146, 248 141, 259 146" strokeWidth="3" />
          <path d="M250 191v7" strokeWidth="3" />
          <path d="M214 272 C 212 234, 227 208, 250 208 C 273 208, 288 234, 286 272" fill="#fff" strokeWidth="3" />
          <path d="M250 208 L 238 234 L 246 240 M250 208 L 262 234 L 254 240" strokeWidth="2.6" />
          <path d="M250 210 V 234" strokeWidth="2" />
          <path d="M278 234 C 294 232, 306 226, 314 215" strokeWidth="3" />
          <path d="M314 215 l6 -3 M314 215 l1.5 6 M314 215 l5.5 1.5" strokeWidth="2.4" />
          <g transform="rotate(-12 214 256)">
            <rect x="196" y="232" width="34" height="46" rx="4" fill="var(--color-accent-light)" strokeWidth="3" />
            <rect x="207" y="228" width="12" height="7" rx="2.5" fill="#fff" strokeWidth="2.4" />
            <path d="M204 248 l18 -3.5 M206 258 l18 -3.5 M208 268 l12 -2.5" strokeWidth="2" />
          </g>
        </g>

        {/* verified seal */}
        <g transform="translate(312,150)">
          <path d="M0-16 4-13 8.5-14 9-9.3 13-7 11-2.8 13 1.4 9 3.7 8.5 8.4 4 7.3 0 10-4 7.3-8.5 8.4-9 3.7-13 1.4-11-2.8-13-7-9-9.3-8.5-14-4-13Z" fill="var(--color-accent)" />
          <path d="M-5 0l3.5 3.5L6-3.5" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* star rating */}
        <g transform="translate(208,300)" fill="var(--color-accent)">
          <g transform="translate(0,0)  scale(.6)"><path d="M10 0l2.9 6 6.6.9-4.8 4.6 1.2 6.5L10 21l-5.9 3 1.2-6.5L.5 6.9 7.1 6z" /></g>
          <g transform="translate(19,0) scale(.6)"><path d="M10 0l2.9 6 6.6.9-4.8 4.6 1.2 6.5L10 21l-5.9 3 1.2-6.5L.5 6.9 7.1 6z" /></g>
          <g transform="translate(38,0) scale(.6)"><path d="M10 0l2.9 6 6.6.9-4.8 4.6 1.2 6.5L10 21l-5.9 3 1.2-6.5L.5 6.9 7.1 6z" /></g>
          <g transform="translate(57,0) scale(.6)"><path d="M10 0l2.9 6 6.6.9-4.8 4.6 1.2 6.5L10 21l-5.9 3 1.2-6.5L.5 6.9 7.1 6z" /></g>
          <g transform="translate(76,0) scale(.6)" fill="none" stroke="var(--color-accent)" strokeWidth="1.7"><path d="M10 0l2.9 6 6.6.9-4.8 4.6 1.2 6.5L10 21l-5.9 3 1.2-6.5L.5 6.9 7.1 6z" /></g>
        </g>
      </g>
      {/* lens rim */}
      <circle cx="250" cy="225" r="118" fill="none" stroke="var(--color-accent-dark)" strokeWidth="9" />
      <circle cx="250" cy="225" r="111" fill="none" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}
