import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../experience/store.ts'
import { createHeartGeometry } from './heart.ts'

const FLOWERS: Array<{ position: [number, number, number]; color: string; scale: number }> = [
  { position: [1.42, 0, 0.35], color: '#f3b7c8', scale: 1 },
  { position: [-1.28, 0, 0.5], color: '#e4d2fb', scale: 0.92 },
  { position: [0.35, 0, 1.38], color: '#f8e4ee', scale: 0.84 },
  { position: [-0.5, 0, -1.32], color: '#f6d0dc', scale: 1.05 },
  { position: [1.2, 0, -0.9], color: '#efe4ff', scale: 0.76 },
  { position: [-1.45, 0, -0.28], color: '#f8d7c4', scale: 0.82 },
]

export function Flowers() {
  return (
    <group>
      {FLOWERS.map((flower) => (
        <Flower key={flower.position.join(',')} {...flower} />
      ))}
    </group>
  )
}

function Flower({
  position,
  color,
  scale,
}: {
  position: [number, number, number]
  color: string
  scale: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    const group = ref.current
    if (!group || store.reducedMotion) return
    group.rotation.z = Math.sin(state.clock.elapsedTime * 0.35 + position[0]) * 0.06
    group.rotation.x = Math.sin(state.clock.elapsedTime * 0.28 + position[2]) * 0.04
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.16, 0.24, Math.sin(angle) * 0.16]} rotation={[0.7, 0, angle]}>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="#f3d48a" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.018, 0.22, 6]} />
        <meshStandardMaterial color="#7f9a7c" roughness={0.7} />
      </mesh>
    </group>
  )
}

const HEARTS: Array<{ position: [number, number, number]; scale: number; color: string; speed: number }> = [
  { position: [-2.4, 1.6, -1.2], scale: 0.28, color: '#f0b3c6', speed: 0.35 },
  { position: [2.2, 2.1, -1.8], scale: 0.22, color: '#e7d2fb', speed: 0.28 },
  { position: [0.4, 2.6, -2.6], scale: 0.18, color: '#f7d7e4', speed: 0.42 },
  { position: [-1.2, 2.35, -2.2], scale: 0.16, color: '#f6e1ea', speed: 0.31 },
  { position: [3.1, 1.4, -2.4], scale: 0.2, color: '#f4c3d2', speed: 0.24 },
]

export function FloatingHearts() {
  const geometry = useMemo(() => createHeartGeometry(), [])
  const refs = useRef<Array<THREE.Mesh | null>>([])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const spread = store.section === 'letter' || store.section === 'memories' ? 1.55 : 1
    const lift = store.section === 'cake' ? 0.45 : 0
    refs.current.forEach((mesh, index) => {
      const spec = HEARTS[index]
      if (!mesh || !spec) return
      const motion = store.reducedMotion ? 0 : Math.sin(time * spec.speed + index) * 0.12
      const targetX = spec.position[0] * spread + store.pointerX * 0.15
      const targetY = spec.position[1] + motion + lift + store.finale * 1.4
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, targetX, 2, delta)
      mesh.position.y = THREE.MathUtils.damp(mesh.position.y, targetY, 2, delta)
      mesh.position.z = spec.position[2]
      mesh.rotation.y = time * 0.25 + index
      if (!store.reducedMotion) mesh.rotation.z = Math.sin(time * 0.4 + index) * 0.15
    })
  })

  return (
    <group>
      {HEARTS.map((heart, index) => (
        <mesh
          key={heart.position.join(',')}
          ref={(node) => {
            refs.current[index] = node
          }}
          geometry={geometry}
          position={heart.position}
          scale={heart.scale}
        >
          <meshStandardMaterial color={heart.color} roughness={0.42} metalness={0.08} />
        </mesh>
      ))}
    </group>
  )
}
