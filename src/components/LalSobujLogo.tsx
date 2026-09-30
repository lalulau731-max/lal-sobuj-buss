import React from 'react';

interface LalSobujLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const LalSobujLogo: React.FC<LalSobujLogoProps> = ({
  className = 'w-24 h-auto',
  width = 96,
  height = 96,
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {/* High-contrast, minimalist, pure black-and-white vector logo optimized for laser printing */}
      <svg
        viewBox="0 0 500 500"
        width={width}
        height={height}
        className="w-full h-auto max-w-full select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crisp Top Canopy Peaks in High-Contrast Solid Black */}
        <path
          d="M125 180 C110 180 115 160 135 140 C155 120 180 100 205 105 C220 108 230 125 245 145 C255 160 250 175 235 175 C220 175 210 160 195 150 C185 142 175 145 160 155 C145 165 135 180 125 180 Z"
          fill="#000000"
        />

        <path
          d="M230 155 C225 148 230 138 245 125 C260 112 280 100 295 105 C310 110 320 125 330 138 C338 148 335 158 322 158 C310 158 300 145 288 138 C280 133 270 135 258 145 C245 155 235 160 230 155 Z"
          fill="#000000"
        />

        {/* Solid Black Horizontal Bar */}
        <path
          d="M115 204 L445 204"
          stroke="#000000"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Clean, Bold, Minimalist Typography: "LAL SABUJ" */}
        <g fill="#000000">
          <text
            x="250"
            y="270"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="64"
            letterSpacing="3"
          >
            LAL SABUJ
          </text>
        </g>

        {/* Dynamic Curved Swoosh Arc */}
        <path
          d="M140 295 C200 270 300 270 360 295"
          stroke="#000000"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Clean, Bold English Typography: "PARIBAHAN" */}
        <g fill="#000000">
          <text
            x="250"
            y="355"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="44"
            letterSpacing="8"
          >
            PARIBAHAN
          </text>
        </g>
      </svg>
    </div>
  );
};
