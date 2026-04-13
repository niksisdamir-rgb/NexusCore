"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MixerParticlesProps {
  active: boolean;
  position: [number, number, number];
}

const PARTICLE_COUNT = 180;

export default React.memo(function MixerParticles({ active, position }: MixerParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.1;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      velocities[i * 3] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 1] = Math.random() * 0.06 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    }
    return { positions, velocities };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  useFrame(() => {
    if (!active || !pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      // Reset particle when it escapes the drum area
      if (pos[i * 3 + 1] > 1.5 || Math.hypot(pos[i * 3], pos[i * 3 + 2]) > 1.4) {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.9;
        pos[i * 3] = Math.cos(theta) * r;
        pos[i * 3 + 1] = -1.1;
        pos[i * 3 + 2] = Math.sin(theta) * r;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <group position={position}>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          color="#cbd5e1"
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </points>
    </group>
  );
});
