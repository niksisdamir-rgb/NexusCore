"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// 1. Silos for Cement
function Silos() {
  return (
    <group position={[-5, 4, -3]}>
      {/* Silo 1 */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 8, 32]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Silo 1 Cone Bottom */}
      <mesh position={[0, -5, 0]} castShadow>
        <coneGeometry args={[1.5, 2, 32]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Silo 2 */}
      <mesh position={[3.5, 0, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 8, 32]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Silo 2 Cone Bottom */}
      <mesh position={[3.5, -5, 0]} castShadow>
        <coneGeometry args={[1.5, 2, 32]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// 2. Aggregates Bins (Sand, Gravel)
function AggregateBins() {
  return (
    <group position={[6, 2, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0, i * -2.5 + 3.75]}>
          {/* Bin top */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[3, 3, 2.3]} />
            <meshStandardMaterial color="#fb923c" metalness={0.2} roughness={0.8} />
          </mesh>
          {/* Hopper bottom */}
          <mesh position={[0, -0.75, 0]} castShadow>
            <coneGeometry args={[1.5, 1.5, 4]} rotation={[Math.PI, Math.PI / 4, 0]} />
            <meshStandardMaterial color="#ea580c" metalness={0.2} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 3. Conveyor Belt
function Conveyor() {
  return (
    <group position={[2.5, 2.5, 0]} rotation={[0, 0, Math.PI / 6]}>
      <mesh castShadow>
        <boxGeometry args={[8, 0.5, 1.5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

// 4. Main Mixer Unit
function MixerUnit() {
  const mixerRef = useRef<THREE.Mesh>(null);
  
  // Rotating central drum
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.rotation.x += delta * 1.5;
    }
  });

  return (
    <group position={[-1, 3, 0]}>
      {/* Structur Base */}
      <mesh position={[0, -2, 0]} castShadow>
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Mixing Drum */}
      <mesh ref={mixerRef} position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 2.5, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Top Cover */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[3.2, 1, 3.2]} />
        <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Ground and Environment
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#d1d5db" roughness={1} />
    </mesh>
  );
}

export default function PlantScene() {
  return (
    <Canvas shadows camera={{ position: [12, 10, 15], fov: 45 }}>
      <color attach="background" args={["#f3f4f6"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      
      <group position={[0, 0, 0]}>
        <Silos />
        <AggregateBins />
        <Conveyor />
        <MixerUnit />
      </group>
      
      <Ground />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={20} blur={2} far={10} />
      
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      <Environment preset="city" />
    </Canvas>
  );
}
