"use client";

import React, { useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Detailed } from "@react-three/drei";
import FloatingLabel from "./FloatingLabel";
import { PLANT_CONFIG, InventoryItem, StreamReading, levelToColor } from "./types";

interface SilosProps {
  inventory: InventoryItem[];
  streamReadings: StreamReading[];
  onSelect?: (id: string, label: string, level: number) => void;
  faultySilos?: string[]; // Array of sensor IDs that are triggering maintenance alerts
}

function SingleSilo({
  index,
  level,
  label,
  position,
  onSelect,
  isFaulty,
}: {
  index: number;
  level: number;
  label: string;
  position: [number, number, number];
  onSelect?: () => void;
  isFaulty?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const shellRef = useRef<THREE.Mesh>(null);
  const { height, radius, funnelHeight } = PLANT_CONFIG.silos;
  const fillHeight = height * Math.max(level, 0.01);
  const fillColor = levelToColor(level);

  useFrame(({ clock }) => {
    if (isFaulty && shellRef.current) {
      const pulse = (Math.sin(clock.elapsedTime * 6) + 1) / 2;
      (shellRef.current.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(pulse, 0, 0);
      (shellRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 2;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
    >
      {/* Hover glow ring */}
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[radius + 0.1, 0.06, 16, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      )}

      <Detailed distances={[0, 15, 30]}>
        {/* Level 0: High detail */}
        <group>
          <mesh castShadow ref={shellRef}>
            <cylinderGeometry args={[radius, radius, height, 32]} />
            <meshStandardMaterial
              color="#9ca3af"
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -height / 2 - funnelHeight / 2, 0]} castShadow>
            <coneGeometry args={[radius, funnelHeight, 32, 1, true]} />
            <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Level 1: Medium detail */}
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[radius, radius, height, 16]} />
            <meshStandardMaterial color="#9ca3af" opacity={0.3} transparent />
          </mesh>
          <mesh position={[0, -height / 2 - funnelHeight / 2, 0]}>
            <coneGeometry args={[radius, funnelHeight, 16]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        </group>

        {/* Level 2: Low detail */}
        <mesh>
          <boxGeometry args={[radius * 2, height + funnelHeight, radius * 2]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </Detailed>

      {/* Cone tip cap (outlet pipe) */}
      <mesh position={[0, -height / 2 - funnelHeight - 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.8, 16]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Top cap with rim */}
      <mesh position={[0, height / 2 + 0.1, 0]} castShadow>
        <cylinderGeometry args={[radius + 0.08, radius + 0.08, 0.2, 32]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Label — always visible */}
      <FloatingLabel text={label} position={[0, height / 2 + 1.0, 0]} color={hovered ? "#38bdf8" : "#e5e7eb"} />

      {/* Level % label — hover only */}
      <FloatingLabel
        text={`${Math.round(level * 100)}%`}
        position={[0, height / 2 + 1.7, 0]}
        color={fillColor}
        hoverOnly
      />
    </group>
  );
}

const Silos = React.memo(function Silos({ inventory, streamReadings, onSelect, faultySilos = [] }: SilosProps) {
  const getLevel = (sensorId: string, fallbackName: string) => {
    const stream = streamReadings.find((r) => r.sensorId === sensorId);
    if (stream) return stream.value / 100;
    const inv = inventory.find((i) => i.name.includes(fallbackName));
    return inv ? inv.amount / inv.capacity : 0.5;
  };

  const { position, gap, labels, sensors, fallbackName } = PLANT_CONFIG.silos;

  return (
    <group position={position}>
      {labels.map((label, i) => {
        const level = getLevel(sensors[i], fallbackName);
        return (
          <SingleSilo
            key={i}
            index={i}
            level={level}
            label={label}
            position={[i * gap, 0, 0]}
            isFaulty={faultySilos.includes(sensors[i])}
            onSelect={() => onSelect?.(sensors[i], label, level)}
          />
        );
      })}
    </group>
  );
});

export default Silos;
