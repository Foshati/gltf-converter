'use client'

import React, { useEffect, useCallback, useState, useRef } from 'react'
import copy from 'clipboard-copy'
import saveAs from 'file-saver'
import { Leva, useControls, button } from 'leva'
import toast from 'react-hot-toast'
import { isGlb } from '@/utils/isExtension'
import useSandbox from '@/utils/useSandbox'
import Code from './Code'
import useStore from '@/utils/store'
import type { Config, PreviewConfig } from '@/types'

import Viewer from './Viewer'

const ResultContent: React.FC = () => {
  const { buffers, fileName, scene, code, createZip, generateScene, animations } = useStore()
  const [isMounted, setIsMounted] = useState(false)
  const configRef = useRef<Config | null>(null)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const config = useControls({
    types: { value: false },
    shadows: { value: true },
    instance: { value: false },
    instanceall: { label: 'instance all', value: false },
    verbose: { value: false },
    keepnames: { value: false, label: 'keep names' },
    keepgroups: { value: false, label: 'keep groups' },
    meta: { value: false },
    precision: { value: 3, min: 1, max: 8, step: 1 },
    pathPrefix: {
      label: 'path prefix',
      value: '',
    },
  }) as Config

  const preview = useControls(
    'preview',
    {
      autoRotate: true,
      contactShadow: true,
      intensity: { value: 1, min: 0, max: 2, step: 0.1, label: 'light intensity' },
      preset: {
        value: 'rembrandt',
        options: ['rembrandt', 'portrait', 'upfront', 'soft'],
      },
      environment: {
        value: 'city',
        options: ['', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
      },
    },
    { collapsed: true },
  ) as PreviewConfig

  const [loading, sandboxId, error, sandboxCode] = useSandbox({
    buffers,
    code,
    config,
    preview,
  })

  useEffect(() => {
    if (isMounted && JSON.stringify(config) !== JSON.stringify(configRef.current)) {
      configRef.current = config
      generateScene(config)
    }
  }, [config, isMounted, generateScene])

  const download = useCallback(async () => {
    createZip({ sandboxCode })
  }, [sandboxCode, createZip])

  useControls(
    'exports',
    {
      'copy to clipboard': button(() =>
        toast.promise(copy(code), {
          loading: 'Loading',
          success: () => 'Successfully copied',
          error: (err) => err.toString(),
        }),
      ),
      'download zip': button(() =>
        toast.promise(download(), {
          loading: 'Loading',
          success: () => 'Ready for download',
          error: (err) => err.toString(),
        }),
      ),
      'download image': button(() => {
        if (typeof document !== 'undefined') {
          const canvas = document.getElementsByTagName('canvas')[0]
          if (canvas) {
            const image = canvas
              .toDataURL('image/png')
              .replace('image/png', 'image/octet-stream')
            saveAs(image, `${fileName.split('.')[0]}.png`)
          }
        }
      }),
    },
    { collapsed: true }
  )

  return (
    <div className="h-full w-screen">
      {!code && !scene ? (
        <p className="text-4xl font-bold w-screen h-screen flex justify-center items-center">Loading ...</p>
      ) : (
        <div className="grid grid-cols-5 h-full">
          {code && <Code>{code}</Code>}
          <section className="h-full w-full col-span-2">
            {scene && <Viewer {...config} {...preview} />}
          </section>
        </div>
      )}
      <Leva titleBar={false} collapsed />
    </div>
  )
}

export default ResultContent