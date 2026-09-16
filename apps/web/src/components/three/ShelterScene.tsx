'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import { useDesignStore } from '@/store/designStore';
import LayeredWall from './WallMesh';

export default function ShelterScene() {
  const [isExploded, setIsExploded] = useState(false);
  const { design } = useDesignStore();

  const length = design?.lengthM ?? 6;
  const width = design?.widthM ?? 4;
  const height = design?.heightM ?? 2.8;

  return (
    <div className="relative w-full h-full min-h-[320px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      {/* Control Overlay */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setIsExploded(!isExploded)}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 shadow-md transition-all"
        >
          {isExploded ? 'Reassemble View' : 'Explode Wall Layers'}
        </button>
      </div>

      <Canvas camera={{ position: [8, 6, 8], fov: 45 }} shadows="basic">
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.4} />

        <Grid
          infiniteGrid
          cellSize={1}
          cellThickness={1}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#475569"
          fadeDistance={30}
        />
        <axesHelper args={[2]} />

        <Center top>
          <LayeredWall
            length={length}
            width={width}
            height={height}
            explodedFactor={isExploded ? 1 : 0}
          />
        </Center>

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}