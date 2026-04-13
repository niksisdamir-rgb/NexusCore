"use client";

import React, { useState } from "react";
import { Billboard, Text } from "@react-three/drei";

interface FloatingLabelProps {
  text: string;
  position: [number, number, number];
  color?: string;
  hoverOnly?: boolean;
}

// Labels are hidden by default and revealed on pointer-over when hoverOnly=true
const FloatingLabel = React.memo(function FloatingLabel({
  text,
  position,
  color = "#ffffff",
  hoverOnly = false,
}: FloatingLabelProps) {
  const [hovered, setHovered] = useState(false);
  const visible = !hoverOnly || hovered;

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Invisible hit area so hover works even with hoverOnly */}
      <mesh>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {visible && (
        <Billboard>
          <Text
            fontSize={0.45}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {text}
          </Text>
        </Billboard>
      )}
    </group>
  );
});

export default FloatingLabel;
