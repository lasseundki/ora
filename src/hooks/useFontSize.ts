import { useState } from 'react'

const SIZES = [15, 17, 20] as const
export type FontSize = typeof SIZES[number]

export function useFontSize() {
  const [size, setSize] = useState<FontSize>(() => {
    const s = localStorage.getItem('ora-font-size')
    return (s && SIZES.includes(Number(s) as FontSize)) ? Number(s) as FontSize : 17
  })

  function update(v: FontSize) {
    setSize(v)
    localStorage.setItem('ora-font-size', String(v))
  }

  return { size, update, sizes: SIZES }
}
