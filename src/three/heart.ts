import * as THREE from 'three'

export function createHeartGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(25, 25)
  shape.bezierCurveTo(25, 25, 20, 0, 0, 0)
  shape.bezierCurveTo(-30, 0, -30, 35, -30, 35)
  shape.bezierCurveTo(-30, 55, -10, 77, 25, 95)
  shape.bezierCurveTo(60, 77, 80, 55, 80, 35)
  shape.bezierCurveTo(80, 35, 80, 0, 50, 0)
  shape.bezierCurveTo(35, 0, 25, 25, 25, 25)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 14,
    bevelEnabled: true,
    bevelThickness: 2.4,
    bevelSize: 2,
    bevelSegments: 1,
    curveSegments: 10,
  })
  geometry.center()
  geometry.scale(0.012, 0.012, 0.012)
  geometry.computeVertexNormals()
  return geometry
}
