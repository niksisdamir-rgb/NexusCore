"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

// Procedurally generates a concrete/asphalt ground texture
function useConcreteTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base concrete grey
    ctx.fillStyle = "#1c1f26";
    ctx.fillRect(0, 0, size, size);

    // Random aggregate speckles
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 2 + 0.5;
      const shade = Math.floor(Math.random() * 40 + 25);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fill();
    }

    // Expansion joint lines
    ctx.strokeStyle = "#0f1117";
    ctx.lineWidth = 2;
    for (let x = 64; x < size; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 64; y < size; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);
}

export default React.memo(function Ground() {
  const concreteTexture = useConcreteTexture();

  return (
    <>
      {/* Main concrete slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          map={concreteTexture}
          roughness={0.95}
          metalness={0.02}
          color="#2a2d36"
        />
      </mesh>

      {/* Raised equipment pad under silos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.02, -2]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#1e2028" roughness={1} />
      </mesh>

      {/* Yellow safety stripe along conveyor edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.03, 0]}>
        <planeGeometry args={[9, 0.3]} />
        <meshStandardMaterial color="#fbbf24" roughness={1} />
      </mesh>
    </>
  );
});
