"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PLANT_CONFIG } from "./types";

// Renders the metal frame/scaffolding around the silo group
export default React.memo(function Scaffolding() {
  const { beamColor, beamWidth } = PLANT_CONFIG.scaffolding;
  const matProps = { color: beamColor, metalness: 0.85, roughness: 0.2 };

  // Silo platform region
  const sx = PLANT_CONFIG.silos.position[0];
  const sy = PLANT_CONFIG.silos.position[1];
  const sz = PLANT_CONFIG.silos.position[2];
  const siloH = PLANT_CONFIG.silos.height;
  const siloR = PLANT_CONFIG.silos.radius;
  const siloGap = PLANT_CONFIG.silos.gap;
  const totalWidth = siloGap + siloR * 2 + 0.5;

  // Platform levels (Y world positions)
  const platformY1 = sy - siloH / 2; // base level
  const platformY2 = sy + siloH / 2 + 0.5; // top level

  // Ladder rungs on side of first silo
  const rungs = Array.from({ length: 8 }, (_, i) => i);

  return (
    <group position={[sx - siloR - 0.3, 0, sz]}>
      {/* Vertical columns */}
      {([0, totalWidth] as const).map((x) =>
        ([-1, 1] as const).map((z) => (
          <mesh
            key={`col_${x}_${z}`}
            position={[x, (platformY1 + platformY2) / 2 - sy + sy, z]}
            castShadow
          >
            <boxGeometry args={[beamWidth, platformY2 - platformY1, beamWidth]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        ))
      )}

      {/* Top horizontal beams */}
      <mesh position={[totalWidth / 2, platformY2 - sy + sy, -1]} castShadow>
        <boxGeometry args={[totalWidth + 0.2, beamWidth, beamWidth]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[totalWidth / 2, platformY2 - sy + sy, 1]} castShadow>
        <boxGeometry args={[totalWidth + 0.2, beamWidth, beamWidth]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[totalWidth / 2, platformY2 - sy + sy, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[totalWidth + 0.2, 2.2, beamWidth]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Diagonal cross-braces */}
      {([{ x: 0, z: -1 }, { x: totalWidth, z: -1 }]).map(({ x, z }, i) => (
        <mesh
          key={`brace_${i}`}
          position={[x + totalWidth / 4, 0, z]}
          rotation={[0, 0, Math.PI / 4]}
          castShadow
        >
          <boxGeometry args={[beamWidth, (platformY2 - platformY1) * 1.4, beamWidth]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}

      {/* Ladder rungs */}
      {rungs.map((rung) => (
        <mesh
          key={rung}
          position={[-0.5, platformY1 + rung * 1.1, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}

      {/* Ladder side rails */}
      {([-0.25, 0.25] as const).map((z) => (
        <mesh
          key={z}
          position={[-0.5, platformY1 + (siloH / 2) * 0.8, z]}
          castShadow
        >
          <boxGeometry args={[beamWidth, siloH * 0.8, beamWidth]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
});
