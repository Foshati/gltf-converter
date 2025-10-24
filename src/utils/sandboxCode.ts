import { encode as arrayBufferToBase64 } from 'base64-arraybuffer'
import type { Config, PreviewConfig } from '@/types'

interface SandboxCodeProps {
  buffers: Map<string, ArrayBuffer> | null
  code: string
  config: Config & PreviewConfig
}

export const sandboxCode = ({ buffers, code, config }: SandboxCodeProps) => {
  const TSDeps = config.types
    ? {
        devDependencies: {
          '@types/react': '18.0.15',
          '@types/react-dom': '18.0.6',
          typescript: '4.7.4',
          'react-scripts': '5.0.1',
        },
      }
    : { devDependencies: { 'react-scripts': '5.0.1' } }

  const bufferEntries = buffers ? Array.from(buffers.entries()) : []

  return {
    files: {
      'public/index.html': {
        content: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
          <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
          <title>React App</title>
        </head>
        <body>
          <noscript>
            You need to enable JavaScript to run this app.
          </noscript>
          <div id="root"></div>
        </body>
        </html>`,
      },
      [`src/index.${config.types ? 'tsx' : 'js'}`]: {
        content: `
import React from 'react'
import ReactDOM from "react-dom"
import './style.css'
import App from "./App"

ReactDOM.render(<App />, document.getElementById("root"))`,
      },
      [`src/App.${config.types ? 'tsx' : 'js'}`]: {
        content: `
import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
${config.instanceall ? 'import { Instances, Model }' : 'import { Model }'} from './Model'

export default function Viewer() {
  const ref = useRef()
  const canvasRef = useRef()
  
  useEffect(() => {
    const handleContextLost = (event) => {
      event.preventDefault()
      console.warn('WebGL context lost, attempting to restore...')
    }
    
    const handleContextRestored = () => {
      console.log('WebGL context restored')
    }
    
    const canvas = canvasRef.current?.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost)
      canvas.addEventListener('webglcontextrestored', handleContextRestored)
      
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])
  
  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100vh' }}>
      <Canvas 
        shadows 
        dpr={[1, 1.5]} 
        camera={{ fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
      >
        <Suspense fallback={null}>
          <Stage controls={ref} preset="${config.preset}" intensity={${config.intensity}} ${
            !config.contactShadow ? ' contactShadow={false}' : ''
          }${!config.shadows ? ' shadows={false}' : ''} environment="${config.environment}">
          ${config.instanceall ? '<Instances>' : ''}
            <Model />
          ${config.instanceall ? '</Instances>' : ''}
          </Stage>
        </Suspense>
        <OrbitControls ref={ref}${config.autoRotate ? ' autoRotate' : ''} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}`,
      },
      'src/style.css': {
        content: `
html,
body,
#root {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}`,
      },
      ...Object.fromEntries(
        bufferEntries.map(([path, buffer]) => [
          `public/${path}`,
          { content: arrayBufferToBase64(buffer) },
        ])
      ),
      [`src/Model.${config.types ? 'tsx' : 'js'}`]: { content: code },
      '.gitignore': {
        content: `
node_modules
build`,
      },
      'package.json': {
        content: {
          dependencies: {
            '@react-three/drei': '^10.7.6',
            '@react-three/fiber': '^9.4.0',
            '@types/three': '^0.180.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            three: '^0.180.0',
          },
          ...TSDeps,
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test --env=jsdom',
            eject: 'react-scripts eject',
          },
          browserslist: ['>0.2%', 'not dead', 'not ie <= 11', 'not op_mini all'],
        },
      },
    },
  }
}