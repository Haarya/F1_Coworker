import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useRaceSession } from '../../context/RaceSessionContext';
import * as THREE from 'three';
import CarPlaceholder from './CarPlaceholder';

const GLB_URL = '/models/ferrari.glb?v=4';

function CarModel({ url, clIndex }: { url: string; clIndex: number }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  const stressColor = new THREE.Color().setHSL(
    (1 - Math.min(1, Math.max(0, clIndex / 100))) * 0.3,
    1,
    0.5
  );

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(Date.now() / 1500) * 0.05 - 0.5;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1.8} />
      <pointLight
        position={[0, 1, 0]}
        color={stressColor}
        intensity={5 + (clIndex / 100) * 10}
        distance={8}
      />
    </group>
  );
}

export default function CarViewport() {
  const { state } = useRaceSession();
  const [webglFailed, setWebglFailed] = useState(false);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setWebglFailed(true);
    });
  }, []);

  if (webglFailed) {
    return <CarPlaceholder />;
  }

  return (
    <div className="w-full h-full bg-[#080808] relative">
      <Canvas
        camera={{ position: [5, 2, -6], fov: 45 }}
        onCreated={handleCreated}
        gl={{ antialias: true, powerPreference: 'default' }}
      >
        {/* Studio Lighting Setup to compensate for missing HDR environment */}
        <ambientLight intensity={1.5} />
        
        {/* Main Key Light */}
        <directionalLight position={[10, 10, -5]} intensity={4.0} color="#ffffff" castShadow />
        
        {/* Fill Light */}
        <directionalLight position={[-10, 5, 10]} intensity={2.0} color="#ffdddd" />
        
        {/* Rim Lights (Red) to make the Ferrari pop */}
        <directionalLight position={[0, 2, -10]} intensity={3.5} color="#e31d2b" />
        <spotLight position={[0, 10, 0]} intensity={5.0} angle={0.8} penumbra={1} color="#ffffff" />
        <spotLight position={[10, 0, 10]} intensity={3.0} angle={0.6} penumbra={0.5} color="#e31d2b" />

        <Suspense fallback={null}>
          <CarModel url={GLB_URL} clIndex={state.currentCLIndex} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(GLB_URL);
