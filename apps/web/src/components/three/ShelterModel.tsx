'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDesignStore } from '@/store/designStore';

export default function ShelterModel() {
  const { design } = useDesignStore();

  const length = design?.lengthM ?? 6;
  const width = design?.widthM ?? 4;
  const baseHeight = design?.heightM ?? 2.8;

  const slabThickness = 0.2;
  const roofThickness = 0.15;
  const pitchAngle = (18 * Math.PI) / 180; // 18-degree roof pitch

  // Roof peak height above wall line
  const roofRise = Math.tan(pitchAngle) * (width / 2);
  const rafterWidth = (width / 2) / Math.cos(pitchAngle) + 0.3; // Includes overhang

  // Triangular gable profile matching shelter width
  const gableShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, roofRise);
    shape.closePath();
    return shape;
  }, [width, roofRise]);

  const gableExtrudeSettings = useMemo(
    () => ({
      depth: 0.05,
      bevelEnabled: false,
    }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Base Concrete Slab */}
      <mesh position={[0, slabThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[length + 0.4, slabThickness, width + 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 2. Main Wall Body */}
      <mesh
        position={[0, slabThickness + baseHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, baseHeight, width]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>

      {/* 3. Front Gable Wall (Extruded along X) */}
      <mesh
        position={[length / 2 - 0.05, slabThickness + baseHeight, 0]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[gableShape, gableExtrudeSettings]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>

      {/* 4. Rear Gable Wall (Extruded along X) */}
      <mesh
        position={[-length / 2, slabThickness + baseHeight, 0]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[gableShape, gableExtrudeSettings]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>

      {/* 5. Left Pitched Roof Panel */}
      <group
        position={[
          0,
          slabThickness + baseHeight + roofRise / 2,
          -width / 4,
        ]}
        rotation={[pitchAngle, 0, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length + 0.4, roofThickness, rafterWidth]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* 6. Right Pitched Roof Panel */}
      <group
        position={[
          0,
          slabThickness + baseHeight + roofRise / 2,
          width / 4,
        ]}
        rotation={[-pitchAngle, 0, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length + 0.4, roofThickness, rafterWidth]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
}