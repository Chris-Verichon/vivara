// Static sunflower SVG — used as logo in the navbar.
// For the animated version, see SunflowerAnimation.tsx.

interface SunflowerSVGProps {
  size?: number
  className?: string
}

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export function SunflowerSVG({ size = 32, className }: SunflowerSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {PETAL_ANGLES.map((angle) => (
        <g key={angle} transform={`rotate(${angle}, 50, 50)`}>
          <ellipse cx="50" cy="22" rx="7" ry="14" fill="#F5C842" />
        </g>
      ))}
      <circle cx="50" cy="50" r="17" fill="#8B5E3C" />
      <circle cx="50" cy="50" r="11" fill="#6B4226" />
    </svg>
  )
}
