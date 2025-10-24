import JSZip from 'jszip'
import { isJson } from './isExtension'

interface SandboxCode {
  files: Record<string, { content: any }>
}

export const createZip = async ({ sandboxCode }: { sandboxCode: SandboxCode }): Promise<Blob> => {
  const zip = new JSZip()
  
  Object.keys(sandboxCode.files).forEach((file) => {
    if (file.startsWith('public') && file !== 'public/index.html') {
      zip.file(file, sandboxCode.files[file].content, { base64: true })
    } else {
      zip.file(
        file,
        isJson(file) ? JSON.stringify(sandboxCode.files[file].content, null, 2) : sandboxCode.files[file].content
      )
    }
  })

  return await zip.generateAsync({ type: 'blob' })
}