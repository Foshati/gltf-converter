import { useEffect, useRef } from 'react'
import useOptimizedSandbox from '@/utils/useOptimizedSandbox'
import type { Config, PreviewConfig } from '@/types'

interface OptimizedSandboxViewerProps {
  buffers: Map<string, ArrayBuffer> | null
  code: string
  config: Config
  preview: PreviewConfig
  className?: string
}

const OptimizedSandboxViewer = ({ buffers, code, config, preview, className }: OptimizedSandboxViewerProps) => {
  const { sandboxUrl, loading, error, refresh } = useOptimizedSandbox({ buffers, code, config, preview })
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Cleanup iframe on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank'
      }
    }
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">در حال ایجاد پیش‌نمایش...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">خطا در ایجاد پیش‌نمایش</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  if (!sandboxUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-600">کد GLTF را وارد کنید</p>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      src={sandboxUrl}
      className={`border-0 w-full h-full ${className}`}
      title="GLTF Preview"
      sandbox="allow-scripts allow-same-origin allow-forms"
      loading="lazy"
    />
  )
}

export default OptimizedSandboxViewer