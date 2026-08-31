import { create } from 'zustand'

export type ModelFormat = 'glb' | 'gltf' | 'stl' | 'obj'
export type MaterialPreset = 'original' | 'clay' | 'gloss' | 'metal' | 'wireframe' | 'normals'

export type ModelMetrics = {
  vertices: number
  triangles: number
  dimensions: [number, number, number]
}

type ModelStore = {
  activeModelUrl: string | null
  fileName: string | null
  format: ModelFormat | null
  isLoading: boolean
  error: string | null
  preset: MaterialPreset
  roughness: number
  metalness: number
  color: string
  wireframeOverlay: boolean
  autoRotate: boolean
  isDark: boolean
  metrics: ModelMetrics | null
  cameraRevision: number
  loadFile: (file: File) => void
  clearModel: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setPreset: (preset: MaterialPreset) => void
  setMaterial: (values: Partial<Pick<ModelStore, 'roughness' | 'metalness' | 'color' | 'wireframeOverlay'>>) => void
  setMetrics: (metrics: ModelMetrics | null) => void
  resetCamera: () => void
  toggleAutoRotate: () => void
  toggleTheme: () => void
}

const acceptedFormats: ModelFormat[] = ['glb', 'gltf', 'stl', 'obj']

export const useModelStore = create<ModelStore>((set, get) => ({
  activeModelUrl: null,
  fileName: null,
  format: null,
  isLoading: false,
  error: null,
  preset: 'original',
  roughness: 0.5,
  metalness: 0,
  color: '#e0e0e0',
  wireframeOverlay: false,
  autoRotate: false,
  isDark: false,
  metrics: null,
  cameraRevision: 0,
  loadFile: (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase() as ModelFormat | undefined
    if (!extension || !acceptedFormats.includes(extension)) {
      set({ error: 'Unsupported format. Use GLB, GLTF, STL, or OBJ.' })
      return
    }
    const previousUrl = get().activeModelUrl
    if (previousUrl) URL.revokeObjectURL(previousUrl)
    set({
      activeModelUrl: URL.createObjectURL(file), fileName: file.name, format: extension,
      isLoading: true, error: null, metrics: null, cameraRevision: get().cameraRevision + 1,
    })
  },
  clearModel: () => {
    const previousUrl = get().activeModelUrl
    if (previousUrl) URL.revokeObjectURL(previousUrl)
    set({ activeModelUrl: null, fileName: null, format: null, isLoading: false, error: null, metrics: null, cameraRevision: get().cameraRevision + 1 })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setPreset: (preset) => set({ preset }),
  setMaterial: (values) => set(values),
  setMetrics: (metrics) => set({ metrics }),
  resetCamera: () => set((state) => ({ cameraRevision: state.cameraRevision + 1 })),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}))
