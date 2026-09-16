'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDesignStore } from '@/store/designStore';

interface LayeredWallProps {
  length: number;
  width: number;
  height: number;
  explodedFactor: number;
}

export default function LayeredWall({
  length,
  width,
  height,
  explodedFactor,
}: LayeredWallProps) {
  const { design } = useDesignStore();

  const apertures = design?.apertures ?? {
    south: { hasDoor: true, windowCount: 2 },
    north: { hasDoor: false, windowCount: 0 },
    east: { hasDoor: false, windowCount: 1 },
    west: { hasDoor: false, windowCount: 1 },
  };

  const winWidth = design?.windowWidthM ?? 1.2;
  const winHeight = design?.windowHeightM ?? 1.4;

  const slabThickness = 0.2;
  const wallThickness = 0.2;
  const roofThickness = 0.15;
  const pitchAngle = (18 * Math.PI) / 180;

  const roofRise = Math.tan(pitchAngle) * (width / 2);
  const rafterWidth = width / 2 / Math.cos(pitchAngle) + 0.3;
  const offset = explodedFactor * 1.2;

  // Offset padding to completely eliminate Z-fighting on wall surfaces
  const Z_OFFSET = wallThickness / 2 + 0.08;

  const gableShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, roofRise);
    shape.closePath();
    return shape;
  }, [width, roofRise]);

  const gableExtrudeSettings = useMemo(
    () => ({ depth: wallThickness, bevelEnabled: false }),
    [wallThickness]
  );

  const calculatePositions = (wallLength: number, windowCount: number, hasDoor: boolean) => {
    const validWinCount = Math.min(2, Math.max(0, windowCount));
    const winPositions: number[] = [];

    if (hasDoor) {
      if (validWinCount === 1) {
        winPositions.push(-wallLength / 4);
      } else if (validWinCount === 2) {
        winPositions.push(-wallLength / 4, wallLength / 4);
      }
    } else {
      if (validWinCount === 1) {
        winPositions.push(0);
      } else if (validWinCount === 2) {
        winPositions.push(-wallLength / 4, wallLength / 4);
      }
    }

    return { doorPos: hasDoor ? 0 : null, winPositions };
  };

  const southLayout = calculatePositions(length, apertures.south.windowCount, apertures.south.hasDoor);
  const northLayout = calculatePositions(length, apertures.north.windowCount, apertures.north.hasDoor);
  const eastLayout = calculatePositions(width, apertures.east.windowCount, apertures.east.hasDoor);
  const westLayout = calculatePositions(width, apertures.west.windowCount, apertures.west.hasDoor);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Base Concrete Slab */}
      <mesh position={[0, slabThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[length + 0.4, slabThickness, width + 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 2. HOLLOW WALL PANELS & PER-SIDE APERTURES */}
      <group>
        {/* SOUTH WALL (+Z) */}
        <group position={[0, 0, width / 2 - wallThickness / 2 + offset]}>
          <mesh position={[0, slabThickness + height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[length, height, wallThickness]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {southLayout.doorPos !== null && (
            <group position={[southLayout.doorPos, slabThickness + 1.01, Z_OFFSET]}>
              {/* Outer Door Frame */}
              <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.04, 2.02, 0.08]} />
                <meshStandardMaterial color="#0f172a" roughness={0.3} />
              </mesh>
              {/* Inner Door Leaf */}
              <mesh position={[0, 0, 0.02]} castShadow>
                <boxGeometry args={[0.92, 1.94, 0.06]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.4} />
              </mesh>
            </group>
          )}
          {southLayout.winPositions.map((posX, idx) => (
            <group key={`s-win-${idx}`} position={[posX, slabThickness + height / 2 + 0.1, Z_OFFSET]}>
              <mesh castShadow>
                <boxGeometry args={[winWidth + 0.1, winHeight + 0.1, 0.06]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[winWidth, winHeight, 0.03]} />
                <meshPhysicalMaterial color="#7dd3fc" transmission={0.9} transparent roughness={0.05} ior={1.5} />
              </mesh>
            </group>
          ))}
        </group>

        {/* NORTH WALL (-Z) */}
        <group position={[0, 0, -width / 2 + wallThickness / 2 - offset]}>
          <mesh position={[0, slabThickness + height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[length, height, wallThickness]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {northLayout.doorPos !== null && (
            <group position={[northLayout.doorPos, slabThickness + 1.01, -Z_OFFSET]} rotation={[0, Math.PI, 0]}>
              <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.04, 2.02, 0.08]} />
                <meshStandardMaterial color="#0f172a" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.02]} castShadow>
                <boxGeometry args={[0.92, 1.94, 0.06]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.4} />
              </mesh>
            </group>
          )}
          {northLayout.winPositions.map((posX, idx) => (
            <group key={`n-win-${idx}`} position={[posX, slabThickness + height / 2 + 0.1, -Z_OFFSET]} rotation={[0, Math.PI, 0]}>
              <mesh castShadow>
                <boxGeometry args={[winWidth + 0.1, winHeight + 0.1, 0.06]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[winWidth, winHeight, 0.03]} />
                <meshPhysicalMaterial color="#7dd3fc" transmission={0.9} transparent roughness={0.05} ior={1.5} />
              </mesh>
            </group>
          ))}
        </group>

        {/* EAST WALL (+X) */}
        <group position={[length / 2 - wallThickness / 2 + offset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, slabThickness + height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - wallThickness * 2, height, wallThickness]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {eastLayout.doorPos !== null && (
            <group position={[eastLayout.doorPos, slabThickness + 1.01, Z_OFFSET]}>
              <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.04, 2.02, 0.08]} />
                <meshStandardMaterial color="#0f172a" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.02]} castShadow>
                <boxGeometry args={[0.92, 1.94, 0.06]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.4} />
              </mesh>
            </group>
          )}
          {eastLayout.winPositions.map((posX, idx) => (
            <group key={`e-win-${idx}`} position={[posX, slabThickness + height / 2 + 0.1, Z_OFFSET]}>
              <mesh castShadow>
                <boxGeometry args={[winWidth + 0.1, winHeight + 0.1, 0.06]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[winWidth, winHeight, 0.03]} />
                <meshPhysicalMaterial color="#7dd3fc" transmission={0.9} transparent roughness={0.05} ior={1.5} />
              </mesh>
            </group>
          ))}
        </group>

        {/* WEST WALL (-X) */}
        <group position={[-length / 2 + wallThickness / 2 - offset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, slabThickness + height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - wallThickness * 2, height, wallThickness]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {westLayout.doorPos !== null && (
            <group position={[westLayout.doorPos, slabThickness + 1.01, Z_OFFSET]}>
              <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.04, 2.02, 0.08]} />
                <meshStandardMaterial color="#0f172a" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.02]} castShadow>
                <boxGeometry args={[0.92, 1.94, 0.06]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.4} />
              </mesh>
            </group>
          )}
          {westLayout.winPositions.map((posX, idx) => (
            <group key={`w-win-${idx}`} position={[posX, slabThickness + height / 2 + 0.1, Z_OFFSET]}>
              <mesh castShadow>
                <boxGeometry args={[winWidth + 0.1, winHeight + 0.1, 0.06]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[winWidth, winHeight, 0.03]} />
                <meshPhysicalMaterial color="#7dd3fc" transmission={0.9} transparent roughness={0.05} ior={1.5} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 3. ROOF & GABLES */}
      <group position={[0, offset * 1.5, 0]}>
        <mesh position={[length / 2 - wallThickness, slabThickness + height, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <extrudeGeometry args={[gableShape, gableExtrudeSettings]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
        <mesh position={[-length / 2, slabThickness + height, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <extrudeGeometry args={[gableShape, gableExtrudeSettings]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
        <group position={[0, slabThickness + height + roofRise / 2, -width / 4]} rotation={[-pitchAngle, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[length + 0.4, roofThickness, rafterWidth]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
          </mesh>
        </group>
        <group position={[0, slabThickness + height + roofRise / 2, width / 4]} rotation={[pitchAngle, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[length + 0.4, roofThickness, rafterWidth]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}