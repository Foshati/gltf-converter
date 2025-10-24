'use client'

import React, { Suspense, useLayoutEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '@/utils/store'
import type { ViewerProps } from '@/types'

const SceneContent: React.FC<{ scene: THREE.Scene; shadows: boolean; intensity: number }> = ({ 
  scene, 
  shadows, 
  intensity 
}) => {
  const clonedScene = useMemo(() => {
    if (!scene) return null
    const clone = scene.clone()
    
    clone.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = obj.receiveShadow = shadows
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat: any) => {
              if (mat.envMapIntensity !== undefined) {
                mat.envMapIntensity = intensity
              }
            })
          } else {
            if (obj.material.envMapIntensity !== undefined) {
              obj.material.envMapIntensity = intensity
            }
          }
        }
      }
    })
    
    return clone
  }, [scene, shadows, intensity])

  if (!clonedScene) return null

  return (
    <Center>
      <primitive object={clonedScene} />
    </Center>
  )
}

const Viewer: React.FC<ViewerProps> = ({ 
  shadows, 
  autoRotate, 
  environment, 
  intensity, 
  contactShadow = true 
}) => {
  const scene = useStore((store) => store.scene)
  const controlsRef = useRef<any>()
  
  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading 3D model...</p>
        </div>
      </div>
    )
  }

  return (
    <Canvas 
      gl={{ 
        preserveDrawingBuffer: true, 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      }} 
      shadows={shadows}
      camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 1000 }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1
      }}
    >
      <color attach="background" args={['#1a1a1a']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={intensity} 
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Environment */}
      {environment && <Environment preset={environment as any} />}
      
      <Suspense fallback={null}>
        <SceneContent scene={scene} shadows={shadows} intensity={intensity} />
        {contactShadow && (
          <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
          />
        )}
      </Suspense>
      
      <OrbitControls 
        ref={controlsRef} 
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={20}
        maxPolarAngle={Math.PI / 1.75}
      />
    </Canvas>
  )
}

export default Viewer