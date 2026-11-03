import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../experience/store.ts'
import { Flowers } from './Flora.tsx'
import { createHeartGeometry } from './heart.ts'

type Anchor = { x: number; y: number; z: number; s: number }

function anchor(): Anchor {
  const mobile = store.compact
  if (!store.introDone) return { x: mobile ? 0 : 0.1, y: mobile ? -1.85 : -1.72, z: 0.2, s: mobile ? 0.58 : 0.7 }
  switch (store.section) {
    case 'world':
      return { x: mobile ? 0 : 1.7, y: mobile ? -1.15 : -0.95, z: 0, s: mobile ? 0.7 : 0.9 }
    case 'cake':
      return { x: 0, y: mobile ? -0.85 : -0.55, z: 0.15, s: mobile ? 0.82 : 1 }
    case 'finale':
      return { x: mobile ? 0 : -1.6, y: -0.85, z: -1.6, s: 0.62 }
    case 'gift':
      return { x: mobile ? 0 : -2.6, y: -0.55, z: -1.4, s: 0.48 }
    default:
      return { x: 0, y: -5.2, z: -1, s: 0.2 }
  }
}

const TIERS = [
  { y: 0.5, radius: 1.16, height: 0.7, color: '#f6b9cc' },
  { y: 1.14, radius: 0.86, height: 0.56, color: '#f6e0bf' },
  { y: 1.64, radius: 0.58, height: 0.44, color: '#ead7fb' },
]

const CANDLES: Array<[number, number]> = [
  [0.16, 0.08],
  [-0.16, 0.1],
  [0.02, -0.18],
  [-0.08, 0.2],
  [0.18, -0.1],
]

function seeded(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export function BirthdayCake3D() {
  const group = useRef<THREE.Group>(null)
  const flames = useRef<Array<THREE.Mesh | null>>([])
  const light = useRef<THREE.PointLight>(null)
  const smokePoints = useRef<THREE.Points>(null)
  const heart = useMemo(() => createHeartGeometry(), [])
  const smoke = useMemo(() => {
    const count = 40
    const positions = new Float32Array(count * 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const state = Array.from({ length: count }, (_, index) => ({
      candle: index % CANDLES.length,
      life: Math.random(),
      drift: (seeded(index) - 0.5) * 0.35,
    }))
    return { positions, geometry, state }
  }, [])

  useFrame((state, delta) => {
    const cake = group.current
    if (!cake) return
    const target = anchor()
    const time = state.clock.elapsedTime
    cake.position.x = THREE.MathUtils.damp(cake.position.x, target.x, 2.2, delta)
    cake.position.y = THREE.MathUtils.damp(cake.position.y, target.y, 2.2, delta)
    cake.position.z = THREE.MathUtils.damp(cake.position.z, target.z, 2.2, delta)
    const scale = THREE.MathUtils.damp(cake.scale.x, target.s, 2.2, delta)
    cake.scale.setScalar(Math.max(0.001, scale))
    cake.visible = scale > 0.05 || target.s > 0.25
    const motion = store.reducedMotion ? 0 : store.intensity
    cake.rotation.y = Math.sin(time * 0.16) * 0.28 * motion + store.pointerX * 0.22
    cake.rotation.z = store.pointerY * -0.03

    const wish = store.wish
    flames.current.forEach((flame, index) => {
      if (!flame) return
      const flicker = 1 + Math.sin(time * (11 + index) + index * 1.7) * 0.08 * (1 - wish)
      const height = Math.max(0.001, flicker * (1 - wish))
      flame.scale.set(Math.max(0.001, 1 - wish * 0.5), height, Math.max(0.001, 1 - wish * 0.5))
      flame.visible = wish < 0.97
    })
    if (light.current) {
      const flicker = 1.5 + Math.sin(time * 15) * 0.25
      light.current.intensity = Math.max(0, flicker * (1 - wish))
    }

    const attribute = smoke.geometry.attributes.position
    smoke.state.forEach((puff, index) => {
      if (wish < 0.08) {
        const candle = CANDLES[puff.candle]
        smoke.positions[index * 3] = candle[0]
        smoke.positions[index * 3 + 1] = 2.05
        smoke.positions[index * 3 + 2] = candle[1]
        puff.life = seeded(index + 3)
        return
      }
      puff.life += delta * 0.22
      if (puff.life > 1) puff.life = 0
      const candle = CANDLES[puff.candle]
      const rise = puff.life * 1.15
      smoke.positions[index * 3] = candle[0] + Math.sin(time * 0.8 + index) * 0.08 + puff.drift * puff.life
      smoke.positions[index * 3 + 1] = 2.05 + rise
      smoke.positions[index * 3 + 2] = candle[1] + Math.cos(time * 0.7 + index) * 0.06
    })
    attribute.needsUpdate = true
    if (smokePoints.current) {
      const material = smokePoints.current.material
      if (!Array.isArray(material)) material.opacity = wish < 0.08 ? 0 : 0.4
    }
  })

  const sprinkles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const tier = TIERS[index % 2]
        const angle = seeded(index) * Math.PI * 2
        const radius = tier.radius * (0.25 + seeded(index + 4) * 0.6)
        return {
          position: [
            Math.cos(angle) * radius,
            tier.y + tier.height / 2 + 0.03,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          color: ['#f08aaa', '#e7c98a', '#d7c4f6', '#fff'][index % 4],
          rotation: seeded(index + 8) * Math.PI,
        }
      }),
    [],
  )

  return (
    <group ref={group} position={[1.15, -0.15, -0.2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.85, 48]} />
        <meshBasicMaterial color="#1a0a16" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.58, 1.64, 0.08, 64]} />
        <meshStandardMaterial color="#fffaf6" roughness={0.42} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.52, 0.018, 10, 60]} />
        <meshStandardMaterial color="#e7c98a" metalness={0.62} roughness={0.28} />
      </mesh>

      {TIERS.map((tier) => (
        <group key={tier.y} position={[0, tier.y, 0]}>
          <mesh>
            <cylinderGeometry args={[tier.radius, tier.radius * 1.015, tier.height, 48]} />
            <meshStandardMaterial color={tier.color} roughness={0.58} metalness={0.02} />
          </mesh>
          <mesh position={[0, tier.height / 2 - 0.01, 0]}>
            <cylinderGeometry args={[tier.radius * 1.045, tier.radius * 1.02, 0.08, 48]} />
            <meshStandardMaterial color="#fff8f3" roughness={0.4} />
          </mesh>
          <mesh position={[0, -tier.height / 2 + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[tier.radius * 0.98, 0.02, 8, 40]} />
            <meshStandardMaterial color="#e7c98a" metalness={0.55} roughness={0.32} />
          </mesh>
          {Array.from({ length: 9 }, (_, index) => {
            const angle = (index / 9) * Math.PI * 2 + tier.y
            const drip = 0.14 + (index % 3) * 0.055
            return (
              <mesh
                key={index}
                position={[Math.cos(angle) * tier.radius * 0.99, tier.height / 2 - drip * 0.45, Math.sin(angle) * tier.radius * 0.99]}
                scale={[0.075, drip, 0.075]}
              >
                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial color="#fff8f3" roughness={0.38} />
              </mesh>
            )
          })}
        </group>
      ))}

      {Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.9, 0.86, Math.sin(angle) * 0.9]}>
            <sphereGeometry args={[0.042, 12, 12]} />
            <meshStandardMaterial color="#fffaf6" roughness={0.22} metalness={0.18} />
          </mesh>
        )
      })}

      {sprinkles.map((sprinkle, index) => (
        <mesh key={index} position={sprinkle.position} rotation={[0, sprinkle.rotation, 0.4]}>
          <capsuleGeometry args={[0.018, 0.05, 3, 6]} />
          <meshStandardMaterial color={sprinkle.color} roughness={0.4} />
        </mesh>
      ))}

      {CANDLES.map(([x, z], index) => (
        <group key={`${x}-${z}`} position={[x, 2.02, z]}>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.032, 0.034, 0.36, 12]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#fff6ee' : '#f6d5e4'} roughness={0.55} />
          </mesh>
          <mesh
            ref={(node) => {
              flames.current[index] = node
            }}
            position={[0, 0.06, 0]}
          >
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color="#ffe1a8" transparent opacity={0.95} />
          </mesh>
          <mesh position={[0, 0.05, 0]} scale={[0.45, 0.7, 0.45]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshBasicMaterial color="#fffaf2" transparent opacity={0.9} />
          </mesh>
        </group>
      ))}

      <pointLight ref={light} position={[0, 2.25, 0.2]} color="#ffd7a4" intensity={1.6} distance={6.5} decay={2} />

      <mesh position={[0, 2.18, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
        <meshStandardMaterial color="#e7c98a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh geometry={heart} position={[0, 2.46, 0]} scale={0.22} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial color="#f2c1d2" roughness={0.4} metalness={0.12} />
      </mesh>

      <points ref={smokePoints} geometry={smoke.geometry} frustumCulled={false}>
        <pointsMaterial color="#f4efe8" size={0.055} transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>

      <Flowers />
    </group>
  )
}
