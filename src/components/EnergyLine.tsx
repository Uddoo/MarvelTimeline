import type { CSSProperties } from "react";

interface EnergyLineProps {
  pulseTarget: number | null;
  pulseVersion: number;
}

const filaments = [
  "M0 41 C70 35 125 44 190 39 S315 44 380 39 S510 35 575 41 S700 45 770 38 S900 36 1000 41",
  "M0 38 C80 43 145 34 220 40 S355 35 425 42 S555 45 630 39 S765 34 830 41 S930 44 1000 38",
  "M0 44 C95 40 160 47 245 41 S395 46 470 40 S615 35 690 43 S830 47 900 40 S960 38 1000 43",
  "M0 36 C75 39 150 33 225 37 S360 42 445 36 S570 32 650 38 S790 43 865 36 S945 33 1000 37",
  "M0 47 C85 44 165 50 250 46 S400 42 480 47 S625 51 710 45 S850 42 925 47 S980 49 1000 46",
];

export function EnergyLine({
  pulseTarget,
  pulseVersion,
}: EnergyLineProps) {
  return (
    <div className="energy-line" aria-hidden="true">
      <svg
        viewBox="0 0 1000 80"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <linearGradient id="energyGradient" x1="0" x2="1">
            <stop offset="0" stopColor="#315a43" stopOpacity=".36" />
            <stop offset=".18" stopColor="#6fb48a" stopOpacity=".78" />
            <stop offset=".52" stopColor="#9ad8aa" stopOpacity=".92" />
            <stop offset=".84" stopColor="#69a77f" stopOpacity=".7" />
            <stop offset="1" stopColor="#315a43" stopOpacity=".3" />
          </linearGradient>
          <filter id="softGlow" x="-10%" y="-100%" width="120%" height="300%">
            <feGaussianBlur stdDeviation="3.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="energy-line__glow" filter="url(#softGlow)">
          {filaments.map((path, index) => (
            <path
              key={path}
              d={path}
              className={`energy-line__filament energy-line__filament--${index + 1}`}
              pathLength="1000"
            />
          ))}
        </g>
        <path
          className="energy-line__current"
          d={filaments[0]}
          pathLength="1000"
        />
      </svg>
      {pulseTarget !== null && (
        <span
          key={pulseVersion}
          className="energy-line__pulse"
          style={
            {
              "--pulse-target": `${pulseTarget}%`,
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
