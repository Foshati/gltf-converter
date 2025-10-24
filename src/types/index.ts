import * as THREE from 'three'

export interface ViewerProps {
  shadows: boolean
  contactShadow?: boolean
  autoRotate: boolean
  environment: string
  preset: string
  intensity: number
}

export interface Config {
  types: boolean
  shadows: boolean
  instance: boolean
  instanceall: boolean
  verbose: boolean
  keepnames: boolean
  keepgroups: boolean
  meta: boolean
  precision: number
  pathPrefix: string
}

export interface PreviewConfig {
  autoRotate: boolean
  contactShadow: boolean
  intensity: number
  preset: string
  environment: string
}

export interface StoreState {
  fileName: string
  buffers: Map<string, ArrayBuffer> | null
  textOriginalFile: string
  animations: boolean
  code: string
  scene: THREE.Scene | null
  createZip: (params: { sandboxCode: any }) => Promise<void>
  generateScene: (config: Config) => Promise<void>
}