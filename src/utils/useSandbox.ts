import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { sandboxCode } from './sandboxCode'
import type { Config, PreviewConfig } from '@/types'

interface UseSandboxProps {
  buffers: Map<string, ArrayBuffer> | null
  code: string
  config: Config
  preview: PreviewConfig
}

const useSandbox = ({ buffers, code, config, preview }: UseSandboxProps): [boolean, string | undefined, boolean, any] => {
  const [sandboxId, setSandboxId] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setErr] = useState(false)
  const [sandboxCodeReturn, setSandboxCode] = useState<any>()
  const abortControllerRef = useRef<AbortController>()
  const lastPropsRef = useRef<string>('')

  const mergedConfig = useMemo(() => ({ ...config, ...preview }), [config, preview])
  
  const propsHash = useMemo(() => {
    return JSON.stringify({
      code: code.trim(),
      config: mergedConfig,
      buffersSize: buffers?.size || 0
    })
  }, [code, mergedConfig, buffers?.size])

  const createSandbox = useCallback(async () => {
    if (!code.trim() || propsHash === lastPropsRef.current) return
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    lastPropsRef.current = propsHash
    setLoading(true)
    setErr(false)
    
    try {
      const props = { buffers, code, config: mergedConfig }
      const sandboxData = sandboxCode(props)
      setSandboxCode(sandboxData)
      
      const response = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(sandboxData),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      
      if (data.sandbox_id) {
        setSandboxId(data.sandbox_id)
      } else {
        throw new Error('No sandbox ID received')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Sandbox creation failed:', err)
        setErr(true)
      }
    } finally {
      setLoading(false)
    }
  }, [buffers, code, mergedConfig, propsHash])

  useEffect(() => {
    if (code.trim()) {
      createSandbox()
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [createSandbox])

  return [loading, sandboxId, error, sandboxCodeReturn]
}

export default useSandbox