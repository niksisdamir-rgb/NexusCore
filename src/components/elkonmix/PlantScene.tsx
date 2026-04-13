"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Billboard, Text, Float } from "@react-three/drei";
import * as THREE from "three";

interface PlantSceneProps {
  activeOrders?: any[];
  inventory?: any[];
}

// 0. Floating Label Component for "Premium" 3D look
function FloatingLabel({ text, position, color = "#ffffff" }: { text: string; position: [number, number, number]; color?: string }) {
  return (
    <Billboard position={position}>
      <Text
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </Billboard>
  );
}

// 1. Silos for Cement
function Silos({ inventory = [] }: { inventory: any[] }) {
  // Find cement inventory levels
  const cement1 = inventory.find(i => i.name.includes("Cement") && i.id % 2 === 0);
  const cement2 = inventory.find(i => i.name.includes("Cement") && i.id % 2 !== 0);

  const getFillScale = (item: any) => {
    if (!item) return 0.5; // default 50%
    return Math.max(0.1, item.amount / item.capacity);
  };

  return (
    <group position={[-5, 4, -3]}>
      {/* Silo 1 */}
      <group position={[0, 0, 0]}>
         <FloatingLabel text="Cement S1" position={[0, 5, 0]} />
         <mesh castShadow>
          <cylinderGeometry args={[1.5, 1.5, 8, 32]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} transparent opacity={0.3} />
        </mesh>
        {/* Fill Level */}
        <mesh position={[0, -4 + (8 * getFillScale(cement1)) / 2, 0]}>
           <cylinderGeometry args={[1.45, 1.45, 8 * getFillScale(cement1), 32]} />
           <meshStandardMaterial color="#fcd34d" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Silo 2 */}
      <group position={[3.5, 0, 0]}>
        <FloatingLabel text="Cement S2" position={[0, 5, 0]} />
        <mesh castShadow>
          <cylinderGeometry args={[1.5, 1.5, 8, 32]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} transparent opacity={0.3} />
        </mesh>
        {/* Fill Level */}
        <mesh position={[0, -4 + (8 * getFillScale(cement2)) / 2, 0]}>
           <cylinderGeometry args={[1.45, 1.45, 8 * getFillScale(cement2), 32]} />
           <meshStandardMaterial color="#fcd34d" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// 2. Aggregates Bins (Sand, Gravel)
function AggregateBins({ inventory = [] }: { inventory: any[] }) {
  const aggregateItems = inventory.filter(i => i.name.includes("Pesak") || i.name.includes("Šljunak"));

  return (
    <group position={[6, 2, 0]}>
      {[0, 1, 2, 3].map((i) => {
        const item = aggregateItems[i];
        const fillScale = item ? Math.max(0.1, item.amount / item.capacity) : 0.5;
        
        return (
          <group key={i} position={[0, 0, i * -2.5 + 3.75]}>
            <FloatingLabel text={item?.name || `Bin ${i+1}`} position={[0, 4, 0]} />
            {/* Bin structure/glass */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[3, 3, 2.3]} />
              <meshStandardMaterial color="#fb923c" metalness={0.1} roughness={1} transparent opacity={0.2} />
            </mesh>
            {/* Material Fill */}
            <mesh position={[0, 0 + (3 * fillScale) / 2, 0]}>
               <boxGeometry args={[2.8, 3 * fillScale, 2.1]} />
               <meshStandardMaterial color={i % 2 === 0 ? "#78350f" : "#451a03"} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 3. Conveyor Belt
function Conveyor({ active }: { active: boolean }) {
  const beltRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (active && beltRef.current) {
      beltRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.02;
    }
  });

  return (
    <group position={[2.5, 2.5, 0]} rotation={[0, 0, Math.PI / 6]}>
      <mesh ref={beltRef} castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[8, 0.2, 1.4]} />
        <meshStandardMaterial color={active ? "#10b981" : "#374151"} metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[8, 0.4, 1.5]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

// 4. Main Mixer Unit
function MixerUnit({ active }: { active: boolean }) {
  const mixerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      const speed = active ? 4.0 : 1.0; 
      mixerRef.current.rotation.x += delta * speed;
    }
  });

  return (
    <group position={[-1, 3, 0]}>
      <FloatingLabel text="MEŠALICA" position={[0, 3, 0]} color={active ? "#3b82f6" : "#ffffff"} />
      {/* Structural Base */}
      <mesh position={[0, -2, 0]} castShadow>
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Mixing Drum */}
      <mesh ref={mixerRef} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 2.5, 16]} />
        <meshStandardMaterial color={active ? "#60a5fa" : "#9ca3af"} metalness={active ? 0.9 : 0.4} roughness={0.2} emissive={active ? "#1d4ed8" : "#000000"} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#111827" roughness={1} />
    </mesh>
  );
}

export default function PlantScene({ activeOrders = [], inventory = [] }: PlantSceneProps) {
  const hasActiveOrder = useMemo(() => {
    return activeOrders.some(order => order.status === 'IN_PROGRESS');
  }, [activeOrders]);

  return (
    <Canvas shadows camera={{ position: [15, 12, 18], fov: 40 }}>
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[20, 30, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      
      {hasActiveOrder && (
        <pointLight position={[-1, 3, 0]} intensity={5.0} color="#3b82f6" distance={15} />
      )}
      
      <group position={[0, 0, 0]}>
        <Silos inventory={inventory} />
        <AggregateBins inventory={inventory} />
        <Conveyor active={hasActiveOrder} />
        <MixerUnit active={hasActiveOrder} />
      </group>
      
      <Ground />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={40} blur={1} far={10} />
      
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      <Environment preset="night" />
    </Canvas>
  );
}
