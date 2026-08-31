import { Bounds, ContactShadows, Environment, OrbitControls, useBounds } from '@react-three/drei'
import { Canvas, useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { useModelStore, type ModelMetrics } from '../store/useModelStore'

function calculateMetrics(object: THREE.Object3D): ModelMetrics {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  let vertices = 0
  let triangles = 0
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const geometry = child.geometry
    const position = geometry.getAttribute('position')
    vertices += position?.count ?? 0
    triangles += geometry.index ? geometry.index.count / 3 : (position?.count ?? 0) / 3
  })
  return { vertices, triangles: Math.floor(triangles), dimensions: [size.x, size.y, size.z] }
}

function applyMaterial(object: THREE.Object3D, preset: ReturnType<typeof useModelStore.getState>['preset'], roughness: number, metalness: number, color: string, wireframeOverlay: boolean) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mesh = child as THREE.Mesh
    if (!mesh.userData.sourceMaterial) mesh.userData.sourceMaterial = mesh.material
    const source = mesh.userData.sourceMaterial as THREE.Material | THREE.Material[]
    if (preset === 'original') {
      mesh.material = source
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => { (material as THREE.MeshBasicMaterial).wireframe = wireframeOverlay })
      return
    }
    if (preset === 'normals') {
      mesh.material = new THREE.MeshNormalMaterial({ wireframe: wireframeOverlay })
      return
    }
    const values = {
      color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#e0e0e0',
      roughness,
      metalness,
      wireframe: preset === 'wireframe' || wireframeOverlay,
    }
    if (preset === 'clay') Object.assign(values, { color: '#e0e0e0', roughness: 0.9, metalness: 0 })
    if (preset === 'gloss') {
      const material = new THREE.MeshPhysicalMaterial({ ...values, roughness: 0.15, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.1 })
      mesh.material = material
      return
    }
    if (preset === 'metal') Object.assign(values, { roughness: 0.35, metalness: 0.95 })
    if (preset === 'wireframe') Object.assign(values, { color: '#000000', roughness: 0.5, metalness: 0 })
    mesh.material = new THREE.MeshStandardMaterial(values)
  })
}

function MaterializedObject({ object }: { object: THREE.Object3D }) {
  const preset = useModelStore((s) => s.preset)
  const roughness = useModelStore((s) => s.roughness)
  const metalness = useModelStore((s) => s.metalness)
  const color = useModelStore((s) => s.color)
  const wireframeOverlay = useModelStore((s) => s.wireframeOverlay)
  const setMetrics = useModelStore((s) => s.setMetrics)
  const setLoading = useModelStore((s) => s.setLoading)
  const clone = useMemo(() => object.clone(true), [object])

  useEffect(() => {
    setMetrics(calculateMetrics(clone))
    setLoading(false)
  }, [clone, setLoading, setMetrics])
  useEffect(() => { applyMaterial(clone, preset, roughness, metalness, color, wireframeOverlay) }, [clone, preset, roughness, metalness, color, wireframeOverlay])
  return <primitive object={clone} />
}

function GltfModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  return <MaterializedObject object={gltf.scene} />
}
function ObjModel({ url }: { url: string }) {
  const object = useLoader(OBJLoader, url)
  return <MaterializedObject object={object} />
}
function StlModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url)
  const object = useMemo(() => new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()), [geometry])
  return <MaterializedObject object={object} />
}

function SampleModel() {
  const object = useMemo(() => {
    const group = new THREE.Group()
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.18, 64), new THREE.MeshStandardMaterial())
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.96, 1.2, 64), new THREE.MeshStandardMaterial())
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.3, 64), new THREE.MeshStandardMaterial())
    body.position.y = 0.68; cap.position.y = 1.42
    group.add(base, body, cap)
    return group
  }, [])
  return <MaterializedObject object={object} />
}

function ResetBounds() {
  const api = useBounds()
  const cameraRevision = useModelStore((s) => s.cameraRevision)
  useEffect(() => { api.refresh().fit().clip() }, [api, cameraRevision])
  return null
}

function SceneContent() {
  const url = useModelStore((s) => s.activeModelUrl)
  const format = useModelStore((s) => s.format)
  const autoRotate = useModelStore((s) => s.autoRotate)
  const isDark = useModelStore((s) => s.isDark)
  return <>
    <color attach="background" args={[isDark ? '#0a0a0a' : '#f7f7f5']} />
    <ambientLight intensity={isDark ? 0.58 : 0.45} />
    <directionalLight position={[5, 7, 6]} intensity={isDark ? 2.5 : 2.1} />
    <directionalLight position={[-6, 3, 2]} intensity={0.65} />
    <directionalLight position={[1, 2, -6]} intensity={0.45} />
    <Environment preset="studio" environmentIntensity={0.35} />
    <Bounds fit clip observe margin={1.35}>
      <ResetBounds />
      {url && format === 'glb' || url && format === 'gltf' ? <GltfModel url={url} /> : null}
      {url && format === 'obj' ? <ObjModel url={url} /> : null}
      {url && format === 'stl' ? <StlModel url={url} /> : null}
      {!url ? <SampleModel /> : null}
    </Bounds>
    <ContactShadows position={[0, -0.12, 0]} opacity={0.4} blur={1.5} far={5} resolution={512} />
    <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1.5} maxDistance={20} autoRotate={autoRotate} autoRotateSpeed={1} />
  </>
}

export function ModelScene() {
  return <Canvas camera={{ position: [4, 3, 5], fov: 42 }} dpr={[1, 2]} shadows onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace }}>
    <SceneContent />
  </Canvas>
}
