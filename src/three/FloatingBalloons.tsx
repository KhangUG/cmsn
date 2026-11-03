import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../experience/store.ts'

type BalloonSpec = {
  position: [number, number, number]
  scale: number
  color: string
  phase: number
}

const BALLOONS: BalloonSpec[] = [
  { position: [-3.5, 1.55, -1.6], scale: 0.78, color: '#f3b4c8', phase: 0.2 },
  { position: [-2.15, 2.55, -2.7], scale: 0.54, color: '#d9c8fb', phase: 1.3 },
  { position: [2.7, 1.75, -1.4], scale: 0.86, color: '#f6e1a6', phase: 0.6 },
  { position: [3.65, 2.65, -2.9], scale: 0.48, color: '#b9d8f6', phase: 1.7 },
  { position: [1.15, 2.9, -3.4], scale: 0.44, color: '#f7c9b4', phase: 0.9 },
  { position: [-4.05, 2.75, -3.5], scale: 0.4, color: '#e7c4f2', phase: 2.1 },
  { position: [0.15, 3.15, -4.2], scale: 0.34, color: '#f8d5e4', phase: 0.4 },
  { position: [-1.35, 1.35, -0.6], scale: 0.36, color: '#cfe3f8', phase: 1.5 },
]

function Balloon({ spec }: { spec: BalloonSpec }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const balloon = group.current
    if (!balloon) return
    const time = state.clock.elapsedTime
    const motion = store.reducedMotion ? 0 : store.intensity
    const float = Math.sin(time * 0.35 + spec.phase) * 0.18 * motion + Math.sin(time * 0.17 + spec.phase * 2) * 0.05 * motion
    const sway = Math.sin(time * 0.22 + spec.phase * 1.7) * 0.07 * motion
    const mouse = store.reducedMotion ? 0 : store.pointerX * (0.1 + spec.scale * 0.08)
    const targetX = spec.position[0] + mouse
    const targetY = spec.position[1] + float
    balloon.position.x = THREE.MathUtils.damp(balloon.position.x, targetX, 1.4, delta)
    balloon.position.y = THREE.MathUtils.damp(balloon.position.y, targetY, 1.1, delta)
    balloon.position.z = spec.position[2]
    balloon.rotation.z = THREE.MathUtils.damp(balloon.rotation.z, sway + store.pointerX * 0.03, 1.6, delta)
    balloon.rotation.y = Math.sin(time * 0.16 + spec.phase) * 0.1 * motion
  })

  return (
    <group ref={group} position={spec.position} scale={spec.scale}>
      <mesh scale={[1, 1.22, 1]} castShadow={false}>
        <sphereGeometry args={[0.46, 28, 28]} />
        <meshStandardMaterial color={spec.color} roughness={0.38} metalness={0.04} />
      </mesh>
      <mesh position={[-0.14, 0.18, 0.28]} scale={[0.16, 0.22, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#fffaf6" transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#f7f1e8" roughness={0.45} />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.28, 6]} />
        <meshBasicMaterial color="#f4eee6" transparent opacity={0.72} />
      </mesh>
    </group>
  )
}

export function FloatingBalloons() {
  const rig = useRef<THREE.Group>(null)
  const specs = useMemo(
    () => (store.quality === 'low' ? BALLOONS.slice(0, 5) : BALLOONS),
    [],
  )

  useFrame((_, delta) => {
    const group = rig.current
    if (!group) return
    const rise = store.finale * (store.compact ? 4.2 : 6.4)
    group.position.y = THREE.MathUtils.damp(group.position.y, rise, 1.4, delta)
  })

  return (
    <group ref={rig}>
      {specs.map((spec) => (
        <Balloon key={spec.color + spec.position.join(',')} spec={spec} />
      ))}
    </group>
  )
}
