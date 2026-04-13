"use client";

import React, { useState } from "react";
import FloatingLabel from "./FloatingLabel";
import { PLANT_CONFIG, InventoryItem, StreamReading, levelToColor } from "./types";

interface AggregateBinsProps {
  inventory: InventoryItem[];
  streamReadings: StreamReading[];
  onSelect?: (id: string, label: string, level: number) => void;
}

const AggregateBins = React.memo(function AggregateBins({
  inventory,
  streamReadings,
  onSelect,
}: AggregateBinsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getLevel = (sensorId: string, searchName: string) => {
    const stream = streamReadings.find((r) => r.sensorId === sensorId);
    if (stream) return stream.value / 100;
    const inv = inventory.find((i) => i.name.includes(searchName));
    return inv ? inv.amount / inv.capacity : 0.5;
  };

  const { position, width, height, depth, gap, count, sensors, names, fillColors } =
    PLANT_CONFIG.bins;

  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => {
        const fillScale = getLevel(sensors[i], names[i]);
        const fillColor = levelToColor(fillScale);
        const isHovered = hoveredIndex === i;
        const label = `${names[i]} ${Math.floor(i / 2) + 1}`;

        return (
          <group
            key={i}
            position={[0, 0, i * -gap + (gap * (count - 1)) / 2]}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredIndex(i); }}
            onPointerOut={() => setHoveredIndex(null)}
            onClick={(e) => { e.stopPropagation(); onSelect?.(sensors[i], label, fillScale); }}
          >
            {/* Transparent bin shell */}
            <mesh position={[0, height / 2, 0]} castShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={isHovered ? "#fed7aa" : "#fb923c"}
                metalness={0.15}
                roughness={0.9}
                transparent
                opacity={0.22}
              />
            </mesh>

            {/* Material fill */}
            <mesh position={[0, (height * fillScale) / 2, 0]}>
              <boxGeometry args={[width - 0.2, height * Math.max(fillScale, 0.01), depth - 0.2]} />
              <meshStandardMaterial
                color={fillColor}
                emissive={fillColor}
                emissiveIntensity={0.08}
                roughness={0.9}
              />
            </mesh>

            {/* Bin frame corners (structural look) */}
            {([-1, 1] as const).map((sx) =>
              ([-1, 1] as const).map((sz) => (
                <mesh
                  key={`${sx}_${sz}`}
                  position={[sx * (width / 2 - 0.06), height / 2, sz * (depth / 2 - 0.06)]}
                  castShadow
                >
                  <boxGeometry args={[0.12, height, 0.12]} />
                  <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
                </mesh>
              ))
            )}

            {/* Label always visible */}
            <FloatingLabel text={label} position={[0, height + 0.6, 0]} color={isHovered ? "#fbbf24" : "#e5e7eb"} />

            {/* Percentage on hover */}
            <FloatingLabel
              text={`${Math.round(fillScale * 100)}%`}
              position={[0, height + 1.3, 0]}
              color={fillColor}
              hoverOnly
            />
          </group>
        );
      })}
    </group>
  );
});

export default AggregateBins;
