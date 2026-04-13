"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import FloatingLabel from "./FloatingLabel";
import { PLANT_CONFIG } from "./types";

interface MixerUnitProps {
  active: boolean;
  onSelect?: () => void;
}

const MixerUnit = React.memo(function MixerUnit({ active, onSelect }: MixerUnitProps) {
  // The drum spins on its own local Y axis (corrected from original X)
  const drumRef = useRef<THREE.Mesh>(null);
  const bladesRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { position } = PLANT_CONFIG.mixer;

  useFrame((_, delta) => {
    const speed = active ? 3.5 : 0.4;
    if (drumRef.current) {
      drumRef.current.rotation.y += delta * speed;
    }
    if (bladesRef.current) {
      bladesRef.current.rotation.y += delta * speed;
    }
  });

  const bladeAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
    >
      <FloatingLabel
        text="MEŠALICA"
        position={[0, 3.5, 0]}
        color={active ? "#60a5fa" : "#9ca3af"}
      />

      {/* Structural base */}
      <mesh position={[0, -2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial
          color={hovered ? "#2563eb" : "#1d4ed8"}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Drum — now a cylinder with correct rotation (horizontal drum, spins on local Y) */}
      <mesh
        ref={drumRef}
        position={[0, 0.6, 0]}
        castShadow
      >
        {/* Drum body — horizontal (Z-axis = length axis) */}
        <cylinderGeometry args={[1.25, 1.25, 2.6, 24]} />
        <meshStandardMaterial
          color={active ? "#3b82f6" : "#6b7280"}
          metalness={0.85}
          roughness={0.15}
          emissive={active ? "#1d4ed8" : "#000000"}
          emissiveIntensity={active ? 0.35 : 0}
        />
      </mesh>

      {/* Mixing blades inside drum that spin independently */}
      <group ref={bladesRef} position={[0, 0.6, 0]}>
        {bladeAngles.map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.85,
              0,
              Math.sin(angle) * 0.85,
            ]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 2.4, 0.5]} />
            <meshStandardMaterial
              color="#93c5fd"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Drum end caps */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[0, 0.6 + side * 1.32, 0]} castShadow>
          <cylinderGeometry args={[1.25, 1.25, 0.08, 24]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Outlet chute at bottom */}
      <mesh position={[0, -4.2, 0.6]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 1.8, 0.3]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Active point light for glow effect */}
      {active && (
        <pointLight
          position={[0, 0.6, 0]}
          intensity={6}
          color="#3b82f6"
          distance={12}
        />
      )}
    </group>
  );
});

export default MixerUnit;
