"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLANT_CONFIG } from "./types";
import FloatingLabel from "./FloatingLabel";

interface ScalePlatformProps {
  active: boolean;
}

const ScalePlatform = React.memo(function ScalePlatform({ active }: ScalePlatformProps) {
  const { position, gap, count } = PLANT_CONFIG.bins;
  // Position it directly under the aggregate bins
  const scaleLen = gap * count; 
  // Adjusted position relative to bins (x is 0 in local coords if we position it globally or locally)
  // We'll place it slightly above the ground, underneath the bins
  const centerZ = ((count - 1) * -gap) / 2 + (gap * (count - 1)); // Midpoint

  return (
    <group position={[position[0] - 0.5, 0.6, position[2] + centerZ]}>
      {/* Outer Scale Frame */}
      <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[2.5, 0.4, scaleLen + 0.5]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* The Weighing Belt / Hopper surface */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.1, scaleLen]} />
        <meshStandardMaterial 
          color={active ? "#fbbf24" : "#94a3b8"} 
          metalness={0.4} 
          roughness={0.8}
        />
      </mesh>

      {/* Support Load Cells (Sensors) */}
      {[-(scaleLen)/2 + 0.5, (scaleLen)/2 - 0.5].map((z, idx) => (
        <group key={idx} position={[0, -0.4, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
            <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} emissive={active ? "#1d4ed8" : "#000"} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {/* Display label for the scale */}
      <FloatingLabel 
        text="Vaga (Weighing)" 
        position={[0, 1.2, 0]} 
        color={active ? "#fbbf24" : "#cbd5e1"} 
        hoverOnly 
      />
    </group>
  );
});

export default ScalePlatform;
