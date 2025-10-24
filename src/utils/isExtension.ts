export const getFileExtension = (file?: string): string | undefined => file?.split('.').pop()

export const isJson = (file?: string): boolean => file?.split('.').pop() === 'json'

export const isGlb = (file?: string): boolean => file?.split('.').pop() === 'glb'

export const isGltf = (file?: string): boolean => file?.split('.').pop() === 'gltf'

export const isZip = (file?: string): boolean => file?.split('.').pop() === 'zip'