import { useEffect, useState, useCallback, useRef } from 'react'
import type { Config, PreviewConfig } from '@/types'

interface UseOptimizedSandboxProps {
  buffers: Map<string, ArrayBuffer> | null
  code: string
  config: Config
  preview: PreviewConfig
}

const useOptimizedSandbox = ({ buffers, code, config, preview }: UseOptimizedSandboxProps) => {
  const [sandboxUrl, setSandboxUrl] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const abortControllerRef = useRef<AbortController>()
  const lastHashRef = useRef<string>('')

  const createSandboxUrl = useCallback(async () => {
    if (!code.trim()) return

    const currentHash = JSON.stringify({ code, config, preview, buffersSize: buffers?.size || 0 })
    if (currentHash === lastHashRef.current) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    lastHashRef.current = currentHash
    
    setLoading(true)
    setError(false)

    try {
      const mergedConfig = { ...config, ...preview }
      
      // Create optimized sandbox data
      const sandboxData = {
        files: {
          'index.html': {
            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GLTF Preview</title>
  <style>
    body { margin: 0; overflow: hidden; background: #f0f0f0; }
    canvas { display: block; }
    .error { padding: 20px; color: red; font-family: monospace; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/three@0.180.0/build/three.min.js"></script>
  <script src="https://unpkg.com/@react-three/fiber@9/dist/index.umd.js"></script>
  <script src="https://unpkg.com/@react-three/drei@10/dist/index.umd.js"></script>
  <script type="module">
    try {
      ${code}
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="error">Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`
          }
        }
      }

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
        setSandboxUrl(`https://codesandbox.io/embed/${data.sandbox_id}?view=preview&hidenavigation=1&theme=dark`)
      } else {
        throw new Error('No sandbox ID received')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Sandbox creation failed:', err)
        setError(true)
      }
    } finally {
      setLoading(false)
    }
  }, [buffers, code, config, preview])

  useEffect(() => {
    createSandboxUrl()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [createSandboxUrl])

  return { sandboxUrl, loading, error, refresh: createSandboxUrl }
}

export default useOptimizedSandbox