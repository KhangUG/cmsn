import { Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { birthdayConfig } from '../config/birthday.ts'
import { store } from '../experience/store.ts'
import { BirthdayCake3D } from './BirthdayCake3D.tsx'
import { Fireworks } from './Fireworks.tsx'
import { FloatingBalloons } from './FloatingBalloons.tsx'
import { FloatingHearts } from './Flora.tsx'
import { GiftBox3D } from './GiftBox3D.tsx'
import { FloatingPetals, ParticleField } from './ParticleField.tsx'

function CameraRig() {
  const look = useRef(new THREE.Vector3(0, 0.42, 0))
  const lookSmoothed = useRef(new THREE.Vector3(0, 0.42, 0))
  const desired = useRef(new THREE.Vector3(0, 1.5, 9.8))

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera
    const targetFov = store.compact ? 46 : 38
    if (Math.abs(camera.fov - targetFov) > 0.2) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }

    const time = state.clock.elapsedTime
    const motion = store.reducedMotion ? 0 : store.intensity
    if (!store.introDone) {
      const sway = Math.sin(time * 0.12) * 0.38 * motion
      const bob = Math.sin(time * 0.18) * 0.07 * motion
      desired.current.set(sway + store.pointerX * 0.18, 1.48 + bob, 9.8 - store.introZoom * 3.05)
      look.current.set(store.pointerX * 0.12, -0.85, 0)
    } else {
      desired.current.set(
        store.camX + store.pointerX * 0.28 * motion,
        store.camY + -store.pointerY * 0.1 * motion + Math.sin(time * 0.15) * 0.05 * motion,
        store.camZ,
      )
      look.current.set(store.lookX, store.lookY, store.lookZ)
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.current.x, 2.1, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.current.y, 2.1, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.current.z, 2.1, delta)
    lookSmoothed.current.x = THREE.MathUtils.damp(lookSmoothed.current.x, look.current.x, 2.1, delta)
    lookSmoothed.current.y = THREE.MathUtils.damp(lookSmoothed.current.y, look.current.y, 2.1, delta)
    lookSmoothed.current.z = THREE.MathUtils.damp(lookSmoothed.current.z, look.current.z, 2.1, delta)
    camera.lookAt(lookSmoothed.current)
  })

  return null
}

function CinematicLights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)

  useFrame((_, delta) => {
    const dim = store.wish * 0.55
    const letter = store.section === 'letter' ? 0.18 : 0
    if (ambient.current) {
      ambient.current.intensity = THREE.MathUtils.damp(
        ambient.current.intensity,
        Math.max(0.35, 1.35 - dim - letter),
        1.6,
        delta,
      )
    }
    if (key.current) {
      key.current.intensity = THREE.MathUtils.damp(key.current.intensity, Math.max(0.45, 2.5 - dim * 1.4), 1.6, delta)
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.35} color="#f6ecff" />
      <hemisphereLight args={['#ffe8f2', '#1a1028', 0.65]} />
      <directionalLight ref={key} position={[4.5, 7.5, 6]} intensity={2.5} color="#fff4ea" />
      <directionalLight position={[-5, 3, -2]} intensity={0.7} color="#c9b6ff" />
      <directionalLight position={[0, 1.5, 7]} intensity={0.85} color="#fff8f2" />
    </>
  )
}

function SkyDressing() {
  const clouds = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    if (clouds.current && !store.reducedMotion) {
      clouds.current.position.x = Math.sin(time * 0.05) * 0.45
    }
    if (rings.current && !store.reducedMotion) {
      rings.current.rotation.z += delta * 0.04 * store.intensity
      rings.current.rotation.x = Math.sin(time * 0.08) * 0.08
    }
  })

  return (
    <>
      <group position={[5.1, 3.5, -9]}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshBasicMaterial color="#ffe7d0" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#ffd8c4" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      </group>
      <group ref={clouds}>
        {[
          { pos: [-4.6, 3.3, -7.2], scale: [2.5, 0.7, 1.2] },
          { pos: [-2.2, 3.75, -8], scale: [1.5, 0.5, 1] },
          { pos: [3.1, 3.15, -7.4], scale: [2.7, 0.75, 1.3] },
          { pos: [5.3, 3.6, -8.4], scale: [1.4, 0.48, 0.9] },
        ].map((cloud) => (
          <mesh key={cloud.pos.join(',')} position={cloud.pos as [number, number, number]} scale={cloud.scale as [number, number, number]}>
            <sphereGeometry args={[1, 20, 20]} />
            <meshBasicMaterial color="#f6efff" transparent opacity={0.1} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <group ref={rings} position={[0.4, 1.2, -0.4]}>
        <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
          <torusGeometry args={[3.3, 0.012, 8, 80]} />
          <meshStandardMaterial color="#e7c98a" metalness={0.7} roughness={0.25} transparent opacity={0.75} />
        </mesh>
        <mesh rotation={[1.1, 0.4, 0.6]}>
          <torusGeometry args={[2.5, 0.008, 8, 70]} />
          <meshStandardMaterial color="#f3d7e6" metalness={0.35} roughness={0.3} transparent opacity={0.55} />
        </mesh>
      </group>
    </>
  )
}

export function SceneCanvas() {
  const color = birthdayConfig.theme.deep
  return (
    <Canvas
      className="h-full w-full"
      dpr={store.quality === 'low' ? 1 : [1, 1.55]}
      camera={{ position: [0, 1.48, 9.8], fov: store.compact ? 46 : 38, near: 0.1, far: 80 }}
      gl={{
        antialias: store.quality === 'high',
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.12
        gl.setClearColor(color)
      }}
    >
      <color attach="background" args={[color]} />
      <fog attach="fog" args={[color, 12, 34]} />
      <CameraRig />
      <CinematicLights />
      <SkyDressing />
      {store.particles ? <ParticleField /> : null}
      {store.particles && !store.reducedMotion ? <FloatingPetals /> : null}
      {store.particles ? (
        <Sparkles
          count={store.quality === 'low' ? 14 : 42}
          scale={[9, 5, 8]}
          size={1.5}
          speed={store.reducedMotion ? 0 : 0.22}
          color="#f8e7c4"
          opacity={0.45}
          position={[0, 1.6, -1]}
        />
      ) : null}
      <FloatingBalloons />
      <FloatingHearts />
      <BirthdayCake3D />
      <GiftBox3D />
      <Fireworks />
    </Canvas>
  )
}
