"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PLANT_CONFIG } from "./types";

// Creates a smooth tube between two world-space points
function PipeTube({
  from,
  to,
  radius = 0.12,
  color = "#4b5563",
  segments = 8,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius?: number;
  color?: string;
  segments?: number;
}) {
  const geometry = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y = Math.min(start.y, end.y) - 1.5; // drop below floor then rise — creates a U-bend

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    return new THREE.TubeGeometry(curve, 20, radius, segments, false);
  }, [from, to, radius, segments]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

// Small elbow joint at connection points
function Joint({ position, color = "#374151" }: { position: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

export default React.memo(function Pipes() {
  // World-space outlet positions derived from PLANT_CONFIG
  const silosBase = PLANT_CONFIG.silos.position;
  const silosH = PLANT_CONFIG.silos.height;
  const silosFunnel = PLANT_CONFIG.silos.funnelHeight;
  const silosGap = PLANT_CONFIG.silos.gap;
  const mixerPos = PLANT_CONFIG.mixer.position;

  // Silo outlets (bottom of funnel + pipe)
  const siloOutlet1: [number, number, number] = [
    silosBase[0],
    silosBase[1] - silosH / 2 - silosFunnel - 0.8,
    silosBase[2],
  ];
  const siloOutlet2: [number, number, number] = [
    silosBase[0] + silosGap,
    silosBase[1] - silosH / 2 - silosFunnel - 0.8,
    silosBase[2],
  ];

  // Bins outlet (bottom of bin)
  const binsBase = PLANT_CONFIG.bins.position;
  const binOutlets: [number, number, number][] = Array.from({ length: 4 }, (_, i) => [
    binsBase[0] - 1.5,
    binsBase[1] - 0.3,
    binsBase[2] + i * -PLANT_CONFIG.bins.gap + (PLANT_CONFIG.bins.gap * 3) / 2,
  ]);

  // Water tank outlets
  const waterBase = PLANT_CONFIG.waterTanks.position;
  const waterOutlet: [number, number, number] = [waterBase[0] + 1.3, waterBase[1] - 2.8, waterBase[2]];

  // Mixer input (top of mixer base)
  const mixerInput: [number, number, number] = [mixerPos[0], mixerPos[1] + 1.2, mixerPos[2]];

  const pipeColor = "#475569";
  const jointColor = "#334155";

  return (
    <group>
      {/* Silo 1 → Mixer */}
      <PipeTube from={siloOutlet1} to={mixerInput} color={pipeColor} radius={0.13} />
      <Joint position={siloOutlet1} color={jointColor} />

      {/* Silo 2 → Mixer */}
      <PipeTube from={siloOutlet2} to={mixerInput} color={pipeColor} radius={0.13} />
      <Joint position={siloOutlet2} color={jointColor} />

      {/* Each aggregate bin → Mixer */}
      {binOutlets.map((outlet, i) => (
        <React.Fragment key={i}>
          <PipeTube from={outlet} to={mixerInput} color={pipeColor} radius={0.1} />
          <Joint position={outlet} color={jointColor} />
        </React.Fragment>
      ))}

      {/* Water tank → Mixer */}
      <PipeTube from={waterOutlet} to={mixerInput} color="#0369a1" radius={0.1} />
      <Joint position={waterOutlet} color="#0284c7" />

      {/* Mixer input joint */}
      <Joint position={mixerInput} color={jointColor} />
    </group>
  );
});
