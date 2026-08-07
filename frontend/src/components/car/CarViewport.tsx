import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { useRaceSession } from '../../context/RaceSessionContext';
import * as THREE from 'three';
import CarPlaceholder from './CarPlaceholder';

// If you have a car.glb in your public folder, pass the url here. 
// Otherwise it falls back gracefully to the placeholder.
const GLB_URL = '/models/ferrari.glb';

function CarModel({ url, clIndex }: { url: string; clIndex: number }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Map CL Index (0-100) to color (Green -> Yellow -> Red)
  const stressColor = new THREE.Color().setHSL(
    (1 - Math.min(1, Math.max(0, clIndex / 100))) * 0.3, // Hue: 0.3 is Green, 0 is Red
    1,
    0.5
  );

  useFrame(() => {
    if (modelRef.current) {
      // Slight floating animation
      modelRef.current.position.y = Math.sin(Date.now() / 1000) * 0.05;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1.5} />
      {/* Dynamic point light based on stress */}
      <pointLight 
        position={[0, 2, 0]} 
        color={stressColor} 
        intensity={2 + (clIndex / 100) * 5} 
        distance={10} 
      />
    </group>
  );
}

export default function CarViewport() {
  const { state } = useRaceSession();

  if (!GLB_URL) {
    return <CarPlaceholder />;
  }

  return (
    <div className="w-full h-full bg-bg-dark border border-border/50 rounded-lg overflow-hidden relative">
      <div className="absolute top-3 left-4 z-10">
        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Chassis Stress View</span>
      </div>
      
      <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <Suspense fallback={null}>
          <CarModel url={GLB_URL} clIndex={state.currentCLIndex} />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
