import React from "react";

export function BrandLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="14"
        fill="url(#brand_logo_grad)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
      />
      {/* Calendar Header Header Bar */}
      <path
        d="M2 14C2 7.37258 7.37258 2 14 2H34C40.6274 2 46 7.37258 46 14V16H2V14Z"
        fill="rgba(255,255,255,0.2)"
      />
      <circle cx="14" cy="9" r="2" fill="#FFFFFF" />
      <circle cx="24" cy="9" r="2" fill="#FFFFFF" />
      <circle cx="34" cy="9" r="2" fill="#FFFFFF" />
      {/* Schedule Grid Lines */}
      <rect x="8" y="22" width="9" height="7" rx="2.5" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="20" y="22" width="20" height="7" rx="2.5" fill="#FFFFFF" fillOpacity="0.5" />
      <rect x="8" y="32" width="20" height="7" rx="2.5" fill="#FFFFFF" fillOpacity="0.5" />
      <rect x="31" y="32" width="9" height="7" rx="2.5" fill="#FFFFFF" fillOpacity="0.9" />
      <defs>
        <linearGradient
          id="brand_logo_grad"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0071E3" />
          <stop offset="1" stopColor="#409CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
