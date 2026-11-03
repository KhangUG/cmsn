import { useLayoutEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../experience/store.ts'
import { createHeartGeometry } from './heart.ts'

type Bit = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  rot: number
  spin: number
}

export function GiftBox3D() {
  const group = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const heart = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.PointLight>(null)
  const confetti = useRef<THREE.InstancedMesh>(null)
  const started = useRef(false)
  const hover = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const heartGeometry = useMemo(() => createHeartGeometry(), [])
  const count = store.quality === 'low' ? 48 : 120
  const ribbon = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e7c98a', metalness: 0.5, roughness: 0.3 }),
    [],
  )
  const bits = useMemo<Bit[]>(
    () =>
      Array.from({ length: count }, () => ({
        x: 0,
        y: -8,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rot: 0,
        spin: 0,
      })),
    [count],
  )

  const hideConfetti = () => {
    const mesh = confetti.current
    if (!mesh) return
    bits.forEach((bit, index) => {
      bit.y = -8
      dummy.position.set(0, -8, 0)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    hideConfetti()
  }, [bits, dummy])

  useFrame((state, delta) => {
    const box = group.current
    if (!box) return
    const open = store.section === 'gift'
    const mobile = store.compact
    const targetY = open ? (mobile ? -0.55 : -0.4) : -6
    const targetS = open ? (mobile ? 0.92 : 1) : 0.4
    box.position.y = THREE.MathUtils.damp(box.position.y, targetY, 2.4, delta)
    const scale = THREE.MathUtils.damp(box.scale.x, targetS, 2.4, delta)
    box.scale.setScalar(Math.max(0.001, scale))
    box.visible = open || scale > 0.45
    if (glow.current) glow.current.intensity = open ? 0.5 + store.gift * 1.8 : 0

    hover.current = THREE.MathUtils.damp(hover.current, store.giftHover, 6, delta)
    const time = state.clock.elapsedTime
    const wiggle = store.gift < 0.05 ? hover.current * Math.sin(time * 8) * 0.08 : 0
    box.rotation.z = wiggle
    box.rotation.y = Math.sin(time * 0.35) * 0.08 + store.pointerX * 0.12
    if (lid.current) lid.current.rotation.x = -store.gift * 2.05

    if (heart.current) {
      const shown = Math.max(0, store.gift - 0.35) / 0.65
      heart.current.position.y = 0.25 + shown * 0.85
      heart.current.scale.setScalar(0.01 + shown * 0.28)
      heart.current.rotation.y = time * 0.6
      const material = heart.current.material
      if (!Array.isArray(material)) material.opacity = shown
    }

    if (store.gift < 0.02) {
      if (started.current) {
        started.current = false
        hideConfetti()
      }
      return
    }

    const mesh = confetti.current
    if (!mesh) return
    if (!started.current && store.gift > 0.18) {
      started.current = true
      bits.forEach((bit) => {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.8 + Math.random() * 1.8
        bit.x = (Math.random() - 0.5) * 0.3
        bit.y = 0.45
        bit.z = (Math.random() - 0.5) * 0.3
        bit.vx = Math.cos(angle) * speed
        bit.vz = Math.sin(angle) * speed
        bit.vy = 1.4 + Math.random() * 1.8
        bit.rot = Math.random() * Math.PI
        bit.spin = (Math.random() - 0.5) * 6
      })
    }
    if (!started.current) return

    const step = Math.min(delta, 0.05)
    bits.forEach((bit, index) => {
      bit.vy -= step * 1.8
      bit.x += bit.vx * step
      bit.y += bit.vy * step
      bit.z += bit.vz * step
      bit.rot += bit.spin * step
      dummy.position.set(bit.x, bit.y, bit.z)
      dummy.rotation.set(bit.rot, bit.rot * 0.4, 0)
      dummy.scale.set(0.08, 0.12, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group} position={[0, -6, 0]} visible={false}>
      <RoundedBox args={[1.24, 0.9, 1.24]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#f0b4c6" roughness={0.48} />
      </RoundedBox>
      <mesh material={ribbon}>
        <boxGeometry args={[0.14, 0.92, 1.26]} />
      </mesh>
      <mesh material={ribbon}>
        <boxGeometry args={[1.26, 0.92, 0.14]} />
      </mesh>

      <group ref={lid} position={[0, 0.46, -0.63]}>
        <group position={[0, 0.08, 0.63]}>
          <RoundedBox args={[1.32, 0.18, 1.28]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color="#f7c9d6" roughness={0.45} />
          </RoundedBox>
          <mesh position={[0, 0.1, 0]} material={ribbon}>
            <boxGeometry args={[0.14, 0.04, 1.28]} />
          </mesh>
          <mesh position={[0, 0.16, 0]} rotation={[0.45, 0.2, 0.7]} material={ribbon}>
            <torusGeometry args={[0.16, 0.04, 10, 22]} />
          </mesh>
          <mesh position={[0, 0.16, 0]} rotation={[0.5, 0.3, -0.75]} material={ribbon}>
            <torusGeometry args={[0.16, 0.04, 10, 22]} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#fff1cc" metalness={0.35} roughness={0.3} />
          </mesh>
        </group>
      </group>

      <mesh ref={heart} geometry={heartGeometry} position={[0, 0.25, 0]} scale={0.01} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial color="#f4b7c8" transparent opacity={0} roughness={0.4} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.4, 0]} color="#ffd9b0" intensity={0} distance={4} />

      <instancedMesh ref={confetti} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#f6d7a4" side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  )
}
