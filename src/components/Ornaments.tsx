"use client";

import { SmokeRing } from "@paper-design/shaders-react";
import { useState, useEffect } from "react";

export function StarIcon({ size = 14, color = "#E9F055", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={className}>
      <path d={`M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z`} fill={color} />
    </svg>
  );
}

export function DiamondIcon({ size = 8, color = "#FA4D31", opacity = 0.7 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8">
      <rect x="4" y="0.7" width="4.7" height="4.7" transform="rotate(45 4 4)" fill={color} opacity={opacity} />
    </svg>
  );
}

export function OrnamentDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--terracotta))" }} />
      <DiamondIcon color="var(--terracotta)" />
      <DiamondIcon color="var(--canary)" />
      <svg width={6} height={6} viewBox="0 0 6 6"><circle cx={3} cy={3} r={3} fill="var(--terracotta)" /></svg>
      <DiamondIcon color="var(--canary)" />
      <DiamondIcon color="var(--terracotta)" />
      <div className="w-20 h-px" style={{ background: "linear-gradient(270deg, transparent, var(--terracotta))" }} />
    </div>
  );
}

export function GoldLine() {
  return (
    <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(233,240,85,0.1), rgba(233,240,85,0.25), rgba(233,240,85,0.1), transparent)" }} />
  );
}

export function LoadingSigil() {
  const [thickness, setThickness] = useState(0.01);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    function animate(now: number) {
      const t = ((now - start) % 3000) / 3000;
      const ease = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      setThickness(0.01 + ease * 0.025);
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[320px] h-[200px]">
        <SmokeRing
          speed={5}
          scale={1.97}
          thickness={thickness}
          radius={0.15}
          innerShape={0.75}
          noiseScale={1.54}
          noiseIterations={2}
          offsetX={0}
          offsetY={0}
          colors={["#E8F054"]}
          colorBack="#00000000"
          style={{ backgroundColor: "transparent", width: "100%", height: "100%" }}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--text-dim)" }}>
          Summoning
        </span>
        <div className="flex gap-1.5 items-center">
          <div className="w-1 h-1 rounded-full bg-[#E9F055] animate-pulse-glow" />
          <div className="w-1 h-1 rounded-full bg-[#E9F055] animate-pulse-glow delay-300" />
          <div className="w-1 h-1 rounded-full bg-[#E9F055] animate-pulse-glow delay-500" />
        </div>
      </div>
    </div>
  );
}
