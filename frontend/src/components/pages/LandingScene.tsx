import { Suspense, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useScroll, Environment } from '@react-three/drei';
import * as THREE from 'three';

export default function LandingScene() {
  const { scene } = useGLTF('/models/ferrari.glb?v=4');
  const scroll = useScroll();
  const { camera } = useThree();
  
  const carGroup = useRef<THREE.Group>(null);
  
  // Pulse the cockpit light based on time
  const cockpitLight = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!carGroup.current) return;

    // Pulse cockpit light to simulate heartbeat/cognitive load
    if (cockpitLight.current) {
      cockpitLight.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 1.5;
    }

    // Scroll offset ranges from 0 to 1
    const offset = scroll.offset;

    // 1. Initial State (offset = 0): Close up on halo/cockpit
    // 2. Isometric (offset 0 -> 0.33): Camera pulls back and up
    // 3. Front Wing (offset 0.33 -> 0.66): Camera sweeps low and front
    // 4. Side Profile (offset 0.66 -> 1.0): Camera moves to perfectly flat side profile

    const startCamPos = new THREE.Vector3(0, 1.2, 1.5); // Halo
    const midCamPos1 = new THREE.Vector3(5, 2.5, 4);    // Isometric
    const midCamPos2 = new THREE.Vector3(2, 0.5, 5);    // Low Front
    const endCamPos = new THREE.Vector3(4.5, 0.5, 0);   // Side Profile (Closer)

    const targetPos = new THREE.Vector3();
    
    if (offset < 0.33) {
      const progress = offset / 0.33;
      targetPos.lerpVectors(startCamPos, midCamPos1, progress);
    } else if (offset < 0.66) {
      const progress = (offset - 0.33) / 0.33;
      targetPos.lerpVectors(midCamPos1, midCamPos2, progress);
    } else {
      const progress = (offset - 0.66) / 0.34;
      targetPos.lerpVectors(midCamPos2, endCamPos, progress);
    }

    // Smoothly move camera
    camera.position.lerp(targetPos, 0.05); // Lowered lerp factor for heavier, cinematic feel
    
    // Interpolate lookAt target so the car moves down on the screen at the end
    const startLook = new THREE.Vector3(0, 0.5, 0);
    const endLook = new THREE.Vector3(0, 1.5, 0); // Looking higher makes car appear lower
    
    const targetLook = new THREE.Vector3();
    if (offset < 0.66) {
      targetLook.copy(startLook);
    } else {
      const progress = (offset - 0.66) / 0.34;
      targetLook.lerpVectors(startLook, endLook, progress);
    }

    camera.lookAt(targetLook);
  });

  return (
    <>
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <ambientLight intensity={0.2} />
      
      {/* Studio Lighting Setup to complement HDR */}
      <directionalLight position={[10, 5, -5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-10, 5, 5]} intensity={1.5} color="#e31d2b" />
      
      {/* Pulsing red cognitive load light in the cockpit */}
      <pointLight ref={cockpitLight} position={[0, 0.8, 0]} color="#ff0000" distance={3} decay={2} />

      {/* Car Group (No rotation, perfectly stable) */}
      <group ref={carGroup}>
        <primitive object={scene} />
      </group>
    </>
  );
}

useGLTF.preload('/models/ferrari.glb?v=4');
