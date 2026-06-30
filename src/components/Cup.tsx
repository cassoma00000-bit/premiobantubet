type Props = {
  size?: number;
  glow?: boolean;
  className?: string;
};

export function Cup({ size = 120, glow = false, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={className}
      style={glow ? { filter: "drop-shadow(0 10px 25px oklch(0.72 0.18 55 / 0.55))" } : undefined}
      aria-hidden
    >
      <defs>
        <linearGradient id="cupBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB061" />
          <stop offset="55%" stopColor="#F08A2A" />
          <stop offset="100%" stopColor="#B85E12" />
        </linearGradient>
        <linearGradient id="cupBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E08020" />
          <stop offset="100%" stopColor="#7A3D0A" />
        </linearGradient>
        <linearGradient id="cupShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3A1C04" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3A1C04" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Cup body - trapezoid, wider at bottom (open side down) */}
      <path
        d="M 32 14 L 88 14 L 104 118 L 16 118 Z"
        fill="url(#cupBody)"
      />
      {/* Left side shading */}
      <path
        d="M 32 14 L 42 14 L 28 118 L 16 118 Z"
        fill="url(#cupShadow)"
        opacity="0.6"
      />
      {/* Top rim (closed top) */}
      <ellipse cx="60" cy="14" rx="28" ry="5" fill="#FF9A3D" />
      <ellipse cx="60" cy="13" rx="22" ry="3" fill="#FFC587" opacity="0.7" />
      {/* Decorative dots band near bottom */}
      {[...Array(7)].map((_, i) => (
        <circle
          key={i}
          cx={26 + i * 11.5}
          cy={92 + Math.abs(i - 3) * 0.5}
          r="2"
          fill="#FFD27A"
        />
      ))}
      {/* Base lip/shadow under opening */}
      <ellipse cx="60" cy="119" rx="46" ry="6" fill="url(#cupBase)" />
      <ellipse cx="60" cy="121" rx="38" ry="3" fill="#1a0a02" opacity="0.5" />
    </svg>
  );
}
