
import React, { useEffect, useRef } from 'react';

const HexGridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const hexSize = 55;
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexHeight = 2 * hexSize;

    interface Hexagon {
      x: number;
      y: number;
      opacity: number;
      targetOpacity: number;
      pulseSpeed: number;
      lastPingTime: number;
      flareIntensity: number;
    }

    const hexagons: Hexagon[] = [];
    let radarAngle = 0;

    const createGrid = () => {
      hexagons.length = 0;
      for (let y = -hexHeight; y < height + hexHeight; y += hexHeight * 0.75) {
        let xOffset = (Math.floor((y + hexHeight) / (hexHeight * 0.75)) % 2) * (hexWidth / 2);
        for (let x = -hexWidth; x < width + hexWidth; x += hexWidth) {
          hexagons.push({
            x: x + xOffset,
            y: y,
            opacity: 0.05,
            targetOpacity: 0.05,
            pulseSpeed: 0.01,
            lastPingTime: 0,
            flareIntensity: 0
          });
        }
      }
    };

    const drawHexagon = (hex: Hexagon, size: number) => {
      const { x, y, flareIntensity } = hex;
      // L'opacité de base est très faible pour la structure
      const baseOpacity = 0.03 + (flareIntensity * 0.3);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      
      if (flareIntensity > 0.1) {
        // Halo de détection (Bleu Cyber)
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
        glow.addColorStop(0, `rgba(14, 165, 233, ${flareIntensity * 0.4})`);
        glow.addColorStop(1, `rgba(2, 132, 199, 0)`);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.strokeStyle = `rgba(14, 165, 233, ${flareIntensity * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Point de verrouillage central
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flareIntensity})`;
        ctx.fill();
      } else {
        // Structure de base (Grille HUD)
        ctx.strokeStyle = `rgba(14, 165, 233, ${baseOpacity})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Fond Noir Profond
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Mise à jour de l'angle du radar
      radarAngle += 0.015;
      if (radarAngle > Math.PI * 2) radarAngle = 0;

      // Ajout de flares aléatoires (pings de données)
      if (Math.random() > 0.97) {
        const randomIndex = Math.floor(Math.random() * hexagons.length);
        hexagons[randomIndex].flareIntensity = 1.0;
      }

      hexagons.forEach(hex => {
        // Calcul de l'angle du hex par rapport au centre
        const dx = hex.x - centerX;
        const dy = hex.y - centerY;
        const angle = Math.atan2(dy, dx) + Math.PI; // 0 to 2PI
        
        // Si le balayage radar passe sur l'hexagone
        const angleDiff = Math.abs(angle - radarAngle);
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (angleDiff < 0.1 && distanceToCenter < Math.max(width, height)) {
            // Intensité basée sur la proximité du sweep
            hex.flareIntensity = Math.max(hex.flareIntensity, 0.6);
        }

        // Décroissance naturelle de la lumière (effet rémanence)
        if (hex.flareIntensity > 0) {
            hex.flareIntensity -= 0.012;
        } else {
            hex.flareIntensity = 0;
        }
        
        drawHexagon(hex, hexSize - 5);
      });

      // Dessin des cercles de radar subtils
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.05)';
      ctx.lineWidth = 0.5;
      for(let r = 200; r < Math.max(width, height); r += 250) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    createGrid();
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createGrid();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default HexGridBackground;
