import React, { useState } from 'react';

interface ChalanLogoBWProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const ChalanLogoBW: React.FC<ChalanLogoBWProps> = ({
  className = 'w-24 sm:w-28 h-auto',
  width = 110,
  height = 90,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative inline-flex items-center justify-start select-none ${className}`}>
      {!imageError ? (
        <img
          src="/chalan_bw_logo.jpg"
          alt="লাল সবুজ পরিবহন"
          width={width}
          height={height}
          onError={() => setImageError(true)}
          className="w-full h-auto object-contain filter contrast-125 grayscale"
          style={{ maxHeight: '72px' }}
        />
      ) : (
        /* Pristine High-Contrast Vector Fallback: 100% Solid Black on White */
        <svg
          viewBox="0 0 500 420"
          width={width}
          height={height}
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Left Canopy Peak */}
          <path
            d="M125 120 C110 120 115 100 135 80 C155 60 180 40 205 45 C220 48 230 65 245 85 C255 100 250 115 235 115 C220 115 210 100 195 90 C185 82 175 85 160 95 C145 105 135 120 125 120 Z"
            fill="#000000"
          />

          {/* Top Right Canopy Peak */}
          <path
            d="M230 95 C225 88 230 78 245 65 C260 52 280 40 295 45 C310 50 320 65 330 78 C338 88 335 98 322 98 C310 98 300 85 288 78 C280 73 270 75 258 85 C245 95 235 100 230 95 Z"
            fill="#000000"
          />

          {/* Horizontal Accent Line */}
          <path
            d="M115 144 L445 144"
            stroke="#000000"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Bold Minimalist Bengali: "লাল সবুজ" */}
          <g fill="#000000">
            <text
              x="115"
              y="215"
              fontFamily="'Hind Siliguri', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="92"
              letterSpacing="-3"
            >
              লাল
            </text>
            <text
              x="265"
              y="215"
              fontFamily="'Hind Siliguri', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="92"
              letterSpacing="-2"
            >
              সবুজ
            </text>
          </g>

          {/* Dynamic Arched Swoosh */}
          <path
            d="M165 242 C215 198 295 198 345 242"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bold Bengali Calligraphy: "পরিবহন" */}
          <g fill="#000000">
            <text
              x="130"
              y="308"
              fontFamily="'Hind Siliguri', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="82"
              letterSpacing="2"
            >
              পরিবহন
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};
