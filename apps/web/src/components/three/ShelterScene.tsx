"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useShelterStore } from "../../../store/useShelterStore";

function GabledRoofStructure({
  length,
  width,
  height,
}: {
  length: number;
  width: number;
  height: number;
}) {
  const roofPitchHeight = 0.8;
  const overhang = 0.25;

  const halfWidth = width / 2;
  const slopeWidth = Math.sqrt(Math.pow(halfWidth + overhang, 2) + Math.pow(roofPitchHeight, 2));
  const pitchAngle = Math.atan2(roofPitchHeight, halfWidth + overhang);

  return (
    <group position={[0, height, 0]}>
      {/* Flush East Gable Cap */}
      <mesh position={[length / 2, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0, 0, -halfWidth,
                0, 0,  halfWidth,
                0, roofPitchHeight, 0
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <meshStandardMaterial color="#ffffff" roughness={0.3} side={2} />
      </mesh>

      {/* Flush West Gable Cap */}
      <mesh position={[-length / 2, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0, 0, -halfWidth,
                0, 0,  halfWidth,
                0, roofPitchHeight, 0
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <meshStandardMaterial color="#ffffff" roughness={0.3} side={2} />
      </mesh>

      {/* South Sloped Roof Panel */}
      <mesh
        position={[0, roofPitchHeight / 2, (halfWidth + overhang) / 2]}
        rotation={[pitchAngle, 0, 0]}
      >
        <boxGeometry args={[length + overhang * 2, 0.08, slopeWidth]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} />
      </mesh>

      {/* North Sloped Roof Panel */}
      <mesh
        position={[0, roofPitchHeight / 2, -(halfWidth + overhang) / 2]}
        rotation={[-pitchAngle, 0, 0]}
      >
        <boxGeometry args={[length + overhang * 2, 0.08, slopeWidth]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} />
      </mesh>
    </group>
  );
}

interface WallProps {
  wallLength: number;
  height: number;
  thickness: number;
  hasDoor: boolean;
  windowCount: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

function WallWithApertures({
  wallLength,
  height,
  thickness,
  hasDoor,
  windowCount,
  position,
  rotation,
}: WallProps) {
  const doorWidth = 0.85;
  const doorHeight = 2.0;

  // Max 2 windows per wall, capped cleanly within boundaries
  const cappedWindows = Math.min(2, Math.max(0, windowCount));
  const windowSize = Math.min(0.7, wallLength * 0.22);
  const windowElevation = 1.4;

  // Z-offset ensures apertures sit cleanly in front of the wall mesh face without clipping
  const zOffset = thickness / 2 + 0.03;

  return (
    <group position={position} rotation={rotation}>
      {/* Wall Surface Panel */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[wallLength, height, thickness]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Centered Door Mesh */}
      {hasDoor && (
        <mesh position={[0, doorHeight / 2, zOffset]}>
          <boxGeometry args={[doorWidth, doorHeight, 0.06]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
      )}

      {/* Window Meshes */}
      {Array.from({ length: cappedWindows }).map((_, idx) => {
        let posX = 0;

        if (hasDoor) {
          if (cappedWindows === 1) {
            posX = Math.min(wallLength * 0.3, doorWidth / 2 + windowSize);
          } else {
            const spacing = Math.min(wallLength * 0.32, doorWidth / 2 + windowSize * 0.9);
            posX = idx === 0 ? -spacing : spacing;
          }
        } else {
          const spacing = Math.min(1.2, wallLength * 0.3);
          posX = (idx - (cappedWindows - 1) / 2) * spacing;
        }

        return (
          <mesh key={idx} position={[posX, windowElevation, zOffset]}>
            <boxGeometry args={[windowSize, windowSize, 0.06]} />
            <meshStandardMaterial
              color="#0284c7"
              transparent
              opacity={0.85}
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ShelterMesh() {
  const { config, apertures } = useShelterStore();
  const { length = 6, width = 4, height = 2.8, orientation = 0 } = config;
  const wallThickness = 0.15;

  return (
    <group rotation={[0, (orientation * Math.PI) / 180, 0]}>
      {/* South Wall */}
      <WallWithApertures
        wallLength={length}
        height={height}
        thickness={wallThickness}
        hasDoor={apertures?.south?.hasDoor ?? false}
        windowCount={apertures?.south?.windowCount ?? 0}
        position={[0, 0, width / 2]}
        rotation={[0, 0, 0]}
      />

      {/* North Wall */}
      <WallWithApertures
        wallLength={length}
        height={height}
        thickness={wallThickness}
        hasDoor={apertures?.north?.hasDoor ?? false}
        windowCount={apertures?.north?.windowCount ?? 0}
        position={[0, 0, -width / 2]}
        rotation={[0, Math.PI, 0]}
      />

      {/* East Wall */}
      <WallWithApertures
        wallLength={width}
        height={height}
        thickness={wallThickness}
        hasDoor={apertures?.east?.hasDoor ?? false}
        windowCount={apertures?.east?.windowCount ?? 0}
        position={[length / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* West Wall */}
      <WallWithApertures
        wallLength={width}
        height={height}
        thickness={wallThickness}
        hasDoor={apertures?.west?.hasDoor ?? false}
        windowCount={apertures?.west?.windowCount ?? 0}
        position={[-length / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Pitched Roof */}
      <GabledRoofStructure
        length={length}
        width={width}
        height={height}
      />

      {/* Base Slab */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[length + 0.4, 0.1, width + 0.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

export default function ShelterScene() {
  return (
    <Canvas camera={{ position: [9, 7, 9], fov: 45 }} className="bg-slate-950">
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 15, 10]} intensity={1.3} />
      <ShelterMesh />
      <OrbitControls makeDefault />
      <gridHelper args={[24, 24, "#334155", "#1e293b"]} />
    </Canvas>
  );
}