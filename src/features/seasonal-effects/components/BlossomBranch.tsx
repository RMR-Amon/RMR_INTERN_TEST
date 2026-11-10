/** Decorative cherry-blossom branch for the spring atmosphere. */
export function BlossomBranch({ className }: { className?: string }) {
  const blossoms: [number, number, number][] = [
    [300, 40, 13], [262, 70, 11], [228, 52, 9], [196, 92, 12], [160, 78, 10],
    [128, 118, 11], [96, 104, 8], [70, 140, 10], [330, 92, 10], [282, 122, 9],
    [214, 136, 8], [354, 58, 9],
  ]
  return (
    <svg className={className} viewBox="0 0 420 220" aria-hidden>
      <defs>
        <radialGradient id="rmr-blossom" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#fbcfe8" />
          <stop offset="1" stopColor="#f472b6" />
        </radialGradient>
      </defs>
      <path
        d="M430 8 C 360 30, 320 50, 270 80 S 170 120, 120 128 S 60 150, 40 170"
        fill="none"
        stroke="#5b3a2e"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M270 80 C 290 110, 300 130, 290 150" fill="none" stroke="#5b3a2e" strokeWidth="4" strokeLinecap="round" />
      <path d="M180 112 C 200 80, 215 66, 238 54" fill="none" stroke="#5b3a2e" strokeWidth="3.5" strokeLinecap="round" />
      {blossoms.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i * 37})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.5} ry={r * 0.68} fill="url(#rmr-blossom)" transform={`rotate(${a})`} />
          ))}
          <circle r={r * 0.22} fill="#f59e0b" opacity="0.85" />
        </g>
      ))}
    </svg>
  )
}
