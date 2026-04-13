"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLANT_CONFIG } from "./types";

interface ConveyorProps {
  active: boolean;
  maintenanceScore?: number;
}


const Conveyor = React.memo(function Conveyor({ active, maintenanceScore = 100 }: ConveyorProps) {
  const beltMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const { position, rotation, length } = PLANT_CONFIG.conveyor;

  useFrame((_, delta) => {
    if (active && beltMatRef.current?.map) {
      // Scroll UV to animate belt movement
      beltMatRef.current.map.offset.x -= delta * 0.8;
    }
  });

  // Procedural stripe texture for the belt
  const beltTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#374151";
    ctx.fillRect(0, 0, 256, 64);
    // Draw chevron/stripe pattern
    for (let x = 0; x < 256; x += 32) {
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(x, 0, 16, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 1);
    return tex;
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Supporting frame */}
      <mesh castShadow>
        <boxGeometry args={[length, 0.4, 1.5]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Animated belt surface */}
      <mesh position={[0, 0.31, 0]} castShadow>
        <boxGeometry args={[length, 0.12, 1.35]} />
        <meshStandardMaterial
          ref={beltMatRef}
          map={beltTexture}
          color={maintenanceScore < 30 ? "#ef4444" : (maintenanceScore < 70 ? "#f59e0b" : (active ? "#10b981" : "#374151"))}
          metalness={0.1}
          roughness={0.9}
          emissive={maintenanceScore < 30 ? "#7f1d1d" : (maintenanceScore < 70 ? "#78350f" : (active ? "#065f46" : "#000000"))}
          emissiveIntensity={maintenanceScore < 85 ? 0.6 : (active ? 0.3 : 0)}
        />
      </mesh>

      {/* Roller wheels at each end */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          position={[(side * length) / 2, 0.2, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Support legs */}
      {[-length / 2 + 1, 0, length / 2 - 1].map((x, idx) => (
        <group key={idx} position={[x, -1.2, 0]}>
          {([-0.6, 0.6] as const).map((z) => (
            <mesh key={z} position={[0, 0, z]} castShadow>
              <boxGeometry args={[0.1, 2.4, 0.1]} />
              <meshStandardMaterial color={PLANT_CONFIG.scaffolding.beamColor} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.1, 1.4]} />
            <meshStandardMaterial color={PLANT_CONFIG.scaffolding.beamColor} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

export default Conveyor;
