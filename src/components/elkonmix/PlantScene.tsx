"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import { InventoryItem, PlantOrder, StreamReading, PLANT_CONFIG } from "./scene/types";
import Silos from "./scene/Silos";
import AggregateBins from "./scene/AggregateBins";
import Conveyor from "./scene/Conveyor";
import MixerUnit from "./scene/MixerUnit";
import WaterTanks from "./scene/WaterTanks";
import Pipes from "./scene/Pipes";
import MixerParticles from "./scene/MixerParticles";
import Scaffolding from "./scene/Scaffolding";
import Ground from "./scene/Ground";

// ─── Typing from types.ts  ────────────────────────────────────────────────────
export interface StreamData {
  readings: StreamReading[];
}

interface PlantSceneProps {
  activeOrders?: PlantOrder[];
  inventory?: InventoryItem[];
  streamData?: StreamData | null;
}

// ─── Info Tooltip (HTML overlay) ─────────────────────────────────────────────
interface TooltipInfo {
  id: string;
  label: string;
  level: number;
}

function InfoTooltip({ info, onClose }: { info: TooltipInfo; onClose: () => void }) {
  const levelColor =
    info.level > 0.6 ? "#22c55e" : info.level > 0.3 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "rgba(15,23,42,0.92)",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: 12,
        padding: "14px 18px",
        minWidth: 200,
        color: "#f1f5f9",
        fontFamily: "monospace",
        fontSize: 13,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 10,
        animation: "fadeInTooltip 0.18s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{info.label}</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            flex: 1,
            height: 10,
            background: "#1e293b",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(info.level * 100).toFixed(0)}%`,
              height: "100%",
              background: levelColor,
              borderRadius: 5,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span style={{ color: levelColor, fontWeight: 700, minWidth: 38 }}>
          {(info.level * 100).toFixed(0)}%
        </span>
      </div>
      <div style={{ marginTop: 8, color: "#64748b", fontSize: 11 }}>
        Sensor ID: {info.id}
      </div>
    </div>
  );
}

// ─── 3D Scene content (separate so Canvas can wrap it) ────────────────────────
function SceneContent({
  inventory,
  streamReadings,
  hasActiveOrder,
  onSelect,
}: {
  inventory: InventoryItem[];
  streamReadings: StreamReading[];
  hasActiveOrder: boolean;
  onSelect: (id: string, label: string, level: number) => void;
}) {
  const mixerPos = PLANT_CONFIG.mixer.position;

  return (
    <>
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.4} />
      <spotLight
        position={[20, 30, 10]}
        angle={0.2}
        penumbra={1}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} />
      {/* Warm area light from side to simulate sunlight */}
      <pointLight position={[12, 8, -8]} intensity={1.2} color="#fde68a" distance={40} />

      <group>
        <Silos inventory={inventory} streamReadings={streamReadings} onSelect={onSelect} />
        <AggregateBins inventory={inventory} streamReadings={streamReadings} onSelect={onSelect} />
        <WaterTanks streamReadings={streamReadings} onSelect={onSelect} />
        <Conveyor active={hasActiveOrder} />
        <MixerUnit active={hasActiveOrder} onSelect={() => onSelect("mixer", "MEŠALICA", hasActiveOrder ? 1 : 0)} />
        <MixerParticles active={hasActiveOrder} position={[mixerPos[0], mixerPos[1] + 0.6, mixerPos[2]]} />
        <Pipes />
        <Scaffolding />
      </group>

      <Ground />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={50} blur={1.5} far={12} />

      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      <Environment preset="night" />

      {/* Bloom — glows the mixer emissive material when active */}
      <EffectComposer>
        <Bloom
          intensity={hasActiveOrder ? 0.8 : 0.15}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PlantScene({
  activeOrders = [],
  inventory = [],
  streamData = null,
}: PlantSceneProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const hasActiveOrder = useMemo(
    () => activeOrders.some((o) => o.status === "IN_PROGRESS"),
    [activeOrders]
  );

  const streamReadings = streamData?.readings ?? [];

  const handleSelect = useCallback((id: string, label: string, level: number) => {
    setTooltip({ id, label, level });
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Inject keyframe for tooltip fade-in */}
      <style>{`@keyframes fadeInTooltip { from { opacity:0; transform:translateY(-6px);} to { opacity:1; transform:translateY(0);} }`}</style>

      <Canvas
        shadows
        camera={{ position: PLANT_CONFIG.camera.position, fov: PLANT_CONFIG.camera.fov }}
        gl={{ antialias: true }}
      >
        <SceneContent
          inventory={inventory}
          streamReadings={streamReadings}
          hasActiveOrder={hasActiveOrder}
          onSelect={handleSelect}
        />
      </Canvas>

      {tooltip && (
        <InfoTooltip info={tooltip} onClose={() => setTooltip(null)} />
      )}
    </div>
  );
}
