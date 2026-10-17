import { useState } from 'react'

function checkWebGLSupport(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  try {
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  } finally {
    canvas.width = 0
    canvas.height = 0
    canvas.remove()
  }
}

export function useWebGLSupport(): boolean {
  const [isSupported] = useState(checkWebGLSupport)
  return isSupported
}
