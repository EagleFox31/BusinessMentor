
import React from 'react';

interface LogoProps {
  className?: string;
}

export const ApexLogo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative ${className} group`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-transform duration-500 group-hover:scale-110"
      >
        {/* Ailes Furtives / Chevron Vision */}
        <path 
          d="M15 25L50 85L85 25L65 25L50 55L35 25H15Z" 
          fill="url(#apexGradient)" 
          className="transition-all duration-300"
        />
        
        {/* Iris Cybernétique (L'Oeil de l'IA) */}
        <circle 
          cx="50" 
          cy="55" 
          r="4" 
          fill="white" 
          className="animate-pulse"
        />
        
        {/* Glow de l'iris */}
        <circle 
          cx="50" 
          cy="55" 
          r="8" 
          fill="#0ea5e9" 
          fillOpacity="0.4"
          className="animate-ping"
          style={{ animationDuration: '3s' }}
        />
        
        {/* Pointe d'Or (Valeur Stratégique) */}
        <path 
          d="M48 82L50 86L52 82H48Z" 
          fill="#fbbf24" 
          className="drop-shadow-[0_0_3px_#fbbf24]"
        />

        <defs>
          <linearGradient id="apexGradient" x1="50" y1="25" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
