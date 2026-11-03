import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../experience/store.ts'

function heartPoint(t: number) {
  const x = 16 * Math.sin(t) ** 3
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return [x * 0.055, y * 0.055 + 1.7] as const
}

export function ParticleField() {
  const count = store.quality === 'low' ? 70 : 220
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const home = useMemo(() => new Float32Array(count * 3), [count])
  const heart = useMemo(() => new Float32Array(count * 3), [count])
  const seeds = useMemo(() => Float32Array.from({ length: count }, () => Math.random() * Math.PI * 2), [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    for (let index = 0; index < count; index += 1) {
      const radius = 1.2 + Math.random() * 6.5
      const angle = Math.random() * Math.PI * 2
      const y = Math.random() * 5.2 - 0.4
      home[index * 3] = Math.cos(angle) * radius
      home[index * 3 + 1] = y
      home[index * 3 + 2] = Math.sin(angle) * radius * 0.55 - 1
      const [hx, hy] = heartPoint((index / count) * Math.PI * 2)
      heart[index * 3] = hx + (Math.random() - 0.5) * 0.12
      heart[index * 3 + 1] = hy + (Math.random() - 0.5) * 0.12
      heart[index * 3 + 2] = (Math.random() - 0.5) * 0.35
      positions[index * 3] = home[index * 3]
      positions[index * 3 + 1] = home[index * 3 + 1]
      positions[index * 3 + 2] = home[index * 3 + 2]
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count, heart, home, positions])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const mix = store.reducedMotion ? 0 : THREE.MathUtils.smoothstep(store.finale, 0.15, 0.85)
    const drift = store.reducedMotion ? 0 : store.intensity
    for (let index = 0; index < count; index += 1) {
      const seed = seeds[index]
      const wanderX = Math.sin(time * 0.15 + seed) * 0.18 * drift
      const wanderY = ((time * 0.05 * drift + seed) % 5.4) - 0.6
      const baseY = home[index * 3 + 1]
      const y = ((baseY + wanderY + 0.8) % 5.6) - 0.6
      positions[index * 3] = THREE.MathUtils.lerp(home[index * 3] + wanderX, heart[index * 3], mix)
      positions[index * 3 + 1] = THREE.MathUtils.lerp(y, heart[index * 3 + 1], mix)
      positions[index * 3 + 2] = THREE.MathUtils.lerp(
        home[index * 3 + 2] + Math.cos(time * 0.12 + seed) * 0.12 * drift,
        heart[index * 3 + 2],
        mix,
      )
    }
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#f8e7c4"
        size={store.quality === 'low' ? 0.045 : 0.035}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

type Petal = {
  x: number
  y: number
  z: number
  speed: number
  spin: number
  rot: number
  sway: number
}

export function FloatingPetals() {
  const count = store.quality === 'low' ? 18 : 54
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 9,
        y: Math.random() * 7,
        z: (Math.random() - 0.5) * 5,
        speed: 0.12 + Math.random() * 0.22,
        spin: (Math.random() - 0.5) * 0.8,
        rot: Math.random() * Math.PI,
        sway: Math.random() * Math.PI * 2,
      })),
    [count],
  )

  useLayoutEffect(() => {
    const current = mesh.current
    if (!current) return
    petals.forEach((petal, index) => {
      dummy.position.set(petal.x, petal.y, petal.z)
      dummy.rotation.set(petal.rot, petal.sway, 0)
      dummy.scale.set(0.09, 0.14, 1)
      dummy.updateMatrix()
      current.setMatrixAt(index, dummy.matrix)
    })
    current.instanceMatrix.needsUpdate = true
  }, [dummy, petals])

  useFrame((_, delta) => {
    const current = mesh.current
    if (!current || store.reducedMotion) return
    const step = Math.min(delta, 0.05) * store.intensity
    petals.forEach((petal, index) => {
      petal.y -= petal.speed * step
      petal.rot += petal.spin * step
      petal.x += Math.sin(petal.y * 0.8 + petal.sway) * 0.18 * step
      if (petal.y < -1.6) {
        petal.y = 6.2
        petal.x = (Math.random() - 0.5) * 9
      }
      dummy.position.set(petal.x, petal.y, petal.z)
      dummy.rotation.set(petal.rot, petal.sway, petal.rot * 0.4)
      dummy.scale.set(0.09, 0.14, 1)
      dummy.updateMatrix()
      current.setMatrixAt(index, dummy.matrix)
    })
    current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#f4b7c9" transparent opacity={0.72} side={THREE.DoubleSide} depthWrite={false} />
    </instancedMesh>
  )
}
