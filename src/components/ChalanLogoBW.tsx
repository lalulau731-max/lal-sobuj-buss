import React, { useState } from 'react';

interface ChalanLogoBWProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const ChalanLogoBW: React.FC<ChalanLogoBWProps> = ({
  className = 'w-48 sm:w-60 h-auto',
  width = 220,
  height = 140,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`chalan-logo relative inline-flex items-center justify-start select-none ${className}`}>
      {!imageError ? (
        <img
          src="/chalan_bw_logo.jpg"
          alt="Lal Sabuj Paribahan"
          width={width}
          height={height}
          onError={() => setImageError(true)}
          className="chalan-logo-img w-full h-auto object-contain filter contrast-125 grayscale"
          style={{ maxHeight: '115px' }}
        />
      ) : (
        /* Pristine High-Contrast Vector Fallback: 100% Solid Black on White */
        <svg
          viewBox="0 0 500 420"
          width={width}
          height={height}
          className="chalan-logo-img w-full h-auto"
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

          {/* Bold Clean English Typography: "LAL SABUJ" */}
          <g fill="#000000">
            <text
              x="250"
              y="225"
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="68"
              letterSpacing="3"
            >
              LAL SABUJ
            </text>
          </g>

          {/* Dynamic Arched Swoosh */}
          <path
            d="M140 250 C200 230 300 230 360 250"
            stroke="#000000"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bold English Typography: "PARIBAHAN" */}
          <g fill="#000000">
            <text
              x="250"
              y="315"
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              fontWeight="800"
              fontSize="48"
              letterSpacing="8"
            >
              PARIBAHAN
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};
