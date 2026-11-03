import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../experience/store.ts'

const PALETTE = ['#f8e7c0', '#f4b8c9', '#e4d2fb', '#fffaf4', '#f3d08a'].map((hex) => new THREE.Color(hex))

export function Fireworks() {
  const count = store.quality === 'low' ? 80 : 200
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const velocities = useMemo(() => new Float32Array(count * 3), [count])
  const colors = useMemo(() => new Float32Array(count * 3), [count])
  const life = useMemo(() => new Float32Array(count), [count])
  const seen = useRef(store.burstToken)
  const finale = useRef({ first: false, second: false })
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [colors, positions])

  const explode = (origin: THREE.Vector3, power: number) => {
    for (let index = 0; index < count; index += 1) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = power * (0.35 + Math.random() * 0.85)
      velocities[index * 3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[index * 3 + 1] = Math.abs(Math.cos(phi)) * speed * 0.85 + 0.25
      velocities[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
      positions[index * 3] = origin.x
      positions[index * 3 + 1] = origin.y
      positions[index * 3 + 2] = origin.z
      const color = PALETTE[index % PALETTE.length]
      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
      life[index] = 1
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  }

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.033)
    if (store.burstToken !== seen.current) {
      seen.current = store.burstToken
      explode(new THREE.Vector3(0, 2.15, 0.2), store.compact ? 1.7 : 2.35)
    }

    if (store.section === 'finale') {
      if (store.sectionT > 0.25 && !finale.current.first) {
        finale.current.first = true
        explode(new THREE.Vector3(-1.1, 2.5, -1.2), 2.5)
      }
      if (store.sectionT > 0.58 && !finale.current.second) {
        finale.current.second = true
        explode(new THREE.Vector3(1.3, 2.7, -1.4), 2.4)
      }
    } else {
      finale.current.first = false
      finale.current.second = false
    }

    let alive = false
    for (let index = 0; index < count; index += 1) {
      if (life[index] <= 0) continue
      alive = true
      life[index] -= step * 0.32
      velocities[index * 3 + 1] -= step * 0.85
      positions[index * 3] += velocities[index * 3] * step
      positions[index * 3 + 1] += velocities[index * 3 + 1] * step
      positions[index * 3 + 2] += velocities[index * 3 + 2] * step
    }
    if (alive) geometry.attributes.position.needsUpdate = true
    const material = points.current?.material
    if (material && !Array.isArray(material)) material.opacity = alive ? 0.95 : 0
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={store.quality === 'low' ? 0.07 : 0.085}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
