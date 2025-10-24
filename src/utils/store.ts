import { saveAs } from 'file-saver'
import { create } from 'zustand'
import * as THREE from 'three'
import { createZip } from './createZip'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { gltfjsx } from 'gltfjsx'
import type { Config } from '@/types'

interface StoreState {
  fileName: string
  buffers: Map<string, ArrayBuffer> | null
  textOriginalFile: string
  animations: boolean
  code: string
  scene: THREE.Scene | null
  createZip: (params: { sandboxCode: any }) => Promise<void>
  generateScene: (config: Config) => Promise<void>
}

const useStore = create<StoreState>((set, get) => ({
  fileName: '',
  buffers: null,
  textOriginalFile: '',
  animations: false,
  code: '',
  scene: null,
  createZip: async ({ sandboxCode }) => {
    const { fileName } = get()
    const blob = await createZip({ sandboxCode })
    saveAs(blob, `${fileName.split('.')[0]}.zip`)
  },
  generateScene: async (config) => {
    const { fileName: rawFileName, buffers } = get()
    if (!buffers) return
    
    try {
      const fileName = config.pathPrefix && config.pathPrefix !== '' ? `${config.pathPrefix}/${rawFileName}` : rawFileName
      const gltfLoader = new GLTFLoader()
      
      // Setup loaders for better GLTF support
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
      gltfLoader.setDRACOLoader(dracoLoader)
      
      const ktx2Loader = new KTX2Loader()
      ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.180.0/examples/jsm/libs/basis/')
      gltfLoader.setKTX2Loader(ktx2Loader)
      
      gltfLoader.setMeshoptDecoder(MeshoptDecoder)
      
      const firstBuffer = buffers.entries().next().value
      if (!firstBuffer) {
        throw new Error('No buffer found')
      }
      
      const result = await new Promise<any>((resolve, reject) => {
        gltfLoader.parse(firstBuffer[1], '', (gltf) => {
          resolve(gltf)
        }, (error) => {
          console.error('GLTF parsing error:', error)
          reject(error)
        })
      })

      // Generate proper React code using gltfjsx
      let code = ''
      try {
        code = await gltfjsx(firstBuffer[1], {
          types: config.types,
          verbose: config.verbose,
          shadows: config.shadows,
          printwidth: 120,
          precision: config.precision,
          keepnames: config.keepnames,
          keepgroups: config.keepgroups,
          meta: config.meta,
          instance: config.instance,
          instanceall: config.instanceall,
        })
      } catch (gltfjsxError) {
        console.warn('gltfjsx failed, using fallback:', gltfjsxError)
        // Fallback code generation
        const componentName = rawFileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '') || 'Model'
        code = `import React from 'react'
import { useGLTF } from '@react-three/drei'

export function ${componentName}(props) {
  const { nodes, materials } = useGLTF('/${fileName}')
  return (
    <group {...props} dispose={null}>
      <primitive object={nodes.Scene || nodes.scene} />
    </group>
  )
}

useGLTF.preload('/${fileName}')`
      }

      // Update state
      set({
        code,
        scene: result.scene,
        animations: !!(result.animations && result.animations.length),
      })
      
    } catch (error) {
      console.error('Error loading GLTF:', error)
      // Set fallback state
      set({
        code: '// Error loading GLTF file',
        scene: null,
        animations: false,
      })
    }
  },
}))

export default useStore

export default useStore