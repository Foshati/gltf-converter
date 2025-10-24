'use client'

import { useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import JSZip from 'jszip'
import { encode as arrayBufferToBase64 } from 'base64-arraybuffer'
import dynamic from 'next/dynamic'
import FileDrop from '@/components/FileDrop'
import useStore from '@/utils/store'
import { isGlb, isGltf, isZip } from '@/utils/isExtension'
import { loadFileAsArrayBuffer, stringToArrayBuffer } from '@/utils/buffers'

const Loading = () => <p className="text-4xl font-bold">Loading ...</p>

const Result = dynamic(() => import('@/components/Result'), {
  ssr: false,
  loading: Loading,
})

export default function Home() {
  const buffers = useStore((state) => state.buffers)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const buffers = new Map<string, ArrayBuffer>()

    await Promise.all(
      acceptedFiles.map((file) =>
        loadFileAsArrayBuffer(file).then((buffer) =>
          buffers.set(file.webkitRelativePath || file.name, buffer)
        )
      )
    )

    for (const [path, buffer] of buffers.entries()) {
      if (isZip(path)) {
        const { files } = await JSZip.loadAsync(buffer)
        for (const [path, file] of Object.entries(files)) {
          const buffer = await file.async('arraybuffer')
          buffers.set(path, buffer)
        }
        buffers.delete(path)
      }
    }

    const filePath = Array.from(buffers.keys()).find((path) => isGlb(path) || isGltf(path))

    if (filePath) {
      useStore.setState({
        buffers,
        fileName: filePath,
        textOriginalFile: btoa(arrayBufferToBase64(buffers.get(filePath)!)),
      })
    }
  }, [])

  const useSuzanne = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const response = await fetch('/suzanne.gltf')
    const suzanneText = await response.text()
    const arr = await stringToArrayBuffer(suzanneText)
    useStore.setState({
      buffers: new Map().set('suzanne.gltf', arr),
      fileName: 'suzanne.gltf',
      textOriginalFile: suzanneText,
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <main className="flex flex-col items-center justify-center flex-1" style={{ height: 'calc(100vh - 56px)' }}>
        {buffers ? <Result /> : <FileDrop onDrop={onDrop} useSuzanne={useSuzanne} />}
      </main>
      <Toaster />
    </div>
  )
}