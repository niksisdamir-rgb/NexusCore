"use client";

import React, { useState } from "react";
import * as THREE from "three";
import FloatingLabel from "./FloatingLabel";
import { PLANT_CONFIG, StreamReading, levelToColor } from "./types";

interface WaterTanksProps {
  streamReadings: StreamReading[];
  onSelect?: (id: string, label: string, level: number) => void;
}

const WaterTanks = React.memo(function WaterTanks({ streamReadings, onSelect }: WaterTanksProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { position, labels, sensors } = PLANT_CONFIG.waterTanks;

  const getLevel = (sensorId: string) => {
    const s = streamReadings.find((r) => r.sensorId === sensorId);
    return s ? s.value / 100 : 0.65;
  };

  const tankHeight = 4;
  const tankRadius = 0.9;

  return (
    <group position={position}>
      {labels.map((label, i) => {
        const level = getLevel(sensors[i]);
        const fillColor = levelToColor(level);
        const fillH = tankHeight * Math.max(level, 0.02);
        const isHovered = hovered === i;
        const isWater = i === 0;

        return (
          <group
            key={i}
            position={[i * 2.6, 0, 0]}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(i); }}
            onPointerOut={() => setHovered(null)}
            onClick={(e) => { e.stopPropagation(); onSelect?.(sensors[i], label, level); }}
          >
            {/* Tank shell */}
            <mesh castShadow>
              <cylinderGeometry args={[tankRadius, tankRadius, tankHeight, 24]} />
              <meshStandardMaterial
                color={isWater ? "#38bdf8" : "#a78bfa"}
                metalness={0.5}
                roughness={0.3}
                transparent
                opacity={0.25}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Fluid fill */}
            <mesh position={[0, -tankHeight / 2 + fillH / 2, 0]}>
              <cylinderGeometry args={[tankRadius - 0.05, tankRadius - 0.05, fillH, 24]} />
              <meshStandardMaterial
                color={isWater ? "#0ea5e9" : "#8b5cf6"}
                emissive={isWater ? "#0369a1" : "#5b21b6"}
                emissiveIntensity={0.2}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>

            {/* Tank rim */}
            <mesh position={[0, tankHeight / 2 + 0.05, 0]}>
              <cylinderGeometry args={[tankRadius + 0.06, tankRadius + 0.06, 0.1, 24]} />
              <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Bottom outlet pipe */}
            <mesh position={[0, -tankHeight / 2 - 0.4, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.8, 12]} />
              <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Support legs */}
            {[45, 135, 225, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <mesh
                  key={deg}
                  position={[Math.cos(rad) * (tankRadius - 0.1), -tankHeight / 2 - 0.75, Math.sin(rad) * (tankRadius - 0.1)]}
                  castShadow
                >
                  <boxGeometry args={[0.1, 1.5, 0.1]} />
                  <meshStandardMaterial color={PLANT_CONFIG.scaffolding.beamColor} metalness={0.7} roughness={0.3} />
                </mesh>
              );
            })}

            <FloatingLabel text={label} position={[0, tankHeight / 2 + 0.8, 0]} color={isHovered ? (isWater ? "#38bdf8" : "#a78bfa") : "#e5e7eb"} />
            <FloatingLabel text={`${Math.round(level * 100)}%`} position={[0, tankHeight / 2 + 1.45, 0]} color={fillColor} hoverOnly />
          </group>
        );
      })}
    </group>
  );
});

export default WaterTanks;
