import React from 'react';

interface PremiumEIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCrown?: boolean;
}

const sizeMap = {
  xs: { box: 'w-4 h-4 text-[9px]', iconSize: 16 },
  sm: { box: 'w-6 h-6 text-xs', iconSize: 24 },
  md: { box: 'w-9 h-9 text-base', iconSize: 36 },
  lg: { box: 'w-12 h-12 text-xl', iconSize: 48 },
  xl: { box: 'w-16 h-16 text-2xl', iconSize: 64 },
};

export default function PremiumEIcon({ size = 'md', className = '', showCrown = false }: PremiumEIconProps) {
  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Radiant Glow */}
      <div className="absolute inset-0 bg-amber-400/30 rounded-2xl blur-[6px] pointer-events-none" />

      {/* SVG Premium E Badge */}
      <svg
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_2px_6px_rgba(217,119,6,0.35)]"
      >
        <defs>
          {/* Outer Border Gold Gradient */}
          <linearGradient id="goldBorderGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          {/* Inner Plate Luxury Metallic Gradient */}
          <linearGradient id="goldPlateGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="25%" stopColor="#92400E" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Letter E High-Shine Metallic Chrome/Gold */}
          <linearGradient id="eGoldGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Crown Gold Gradient */}
          <linearGradient id="crownGrad" x1="16" y1="2" x2="32" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <filter id="softBevel" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Squircle Badge Background */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="url(#goldPlateGrad)"
          stroke="url(#goldBorderGrad)"
          strokeWidth="2.5"
        />

        {/* Subtle Inner Ring Inset */}
        <rect
          x="5.5"
          y="5.5"
          width="37"
          height="37"
          rx="9.5"
          fill="none"
          stroke="#FDE68A"
          strokeOpacity="0.3"
          strokeWidth="1"
        />

        {/* Signature Stylized Premium Letter 'E' */}
        {/* Modern geometric silhouette with beveled terminals and chamfers */}
        <path
          d="M15 13.5C15 12.6716 15.6716 12 16.5 12H32C33.1046 12 34 12.8954 34 14V16.5C34 17.0523 33.5523 17.5 33 17.5H21.5V21.5H30.5C31.3284 21.5 32 22.1716 32 23V25C32 25.8284 31.3284 26.5 30.5 26.5H21.5V30.5H33C33.5523 30.5 34 30.9477 34 31.5V34C34 35.1046 33.1046 36 32 36H16.5C15.6716 36 15 35.3284 15 34.5V13.5Z"
          fill="url(#eGoldGrad)"
          filter="url(#softBevel)"
        />

        {/* Sparkling Star Accents */}
        <circle cx="34" cy="14" r="1.2" fill="#FFFFFF" />
        <circle cx="14" cy="34" r="0.9" fill="#FEF3C7" />
        <path
          d="M36 24L37 21L38 24L41 25L38 26L37 29L36 26L33 25L36 24Z"
          fill="#FFFBEB"
          opacity="0.8"
        />

        {/* Optional Crown Crest */}
        {showCrown && (
          <path
            d="M18 7L21 9.5L24 5L27 9.5L30 7L29 11H19L18 7Z"
            fill="url(#crownGrad)"
            stroke="#78350F"
            strokeWidth="0.5"
          />
        )}
      </svg>
    </div>
  );
}
