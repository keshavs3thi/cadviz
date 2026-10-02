import { create } from 'zustand'

export type ModelFormat = 'glb' | 'gltf' | 'stl' | 'obj'
export type MaterialPreset = 'original' | 'clay' | 'gloss' | 'metal' | 'wireframe' | 'normals'
export type LightingMode = 'studio' | 'soft' | 'high-key' | 'technical'
export type EnvironmentScene = 'studio' | 'city' | 'warehouse' | 'apartment' | 'sunset'
export type BackdropMode = 'paper' | 'white' | 'dark' | 'grid'
export type CameraMode = 'perspective' | 'orthographic'

export type ModelMetrics = {
  vertices: number
  triangles: number
  dimensions: [number, number, number]
}

type ModelStore = {
  activeModelUrl: string | null
  assetUrls: Record<string, string>
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
  lighting: LightingMode
  brightness: number
  environmentScene: EnvironmentScene
  backdrop: BackdropMode
  cameraMode: CameraMode
  isViewPanelOpen: boolean
  metrics: ModelMetrics | null
  cameraRevision: number
  loadFile: (file: File) => void
  loadFiles: (files: File[]) => void
  clearModel: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setPreset: (preset: MaterialPreset) => void
  setMaterial: (values: Partial<Pick<ModelStore, 'roughness' | 'metalness' | 'color' | 'wireframeOverlay'>>) => void
  setMetrics: (metrics: ModelMetrics | null) => void
  resetCamera: () => void
  toggleAutoRotate: () => void
  toggleTheme: () => void
  setLighting: (lighting: LightingMode) => void
  setBrightness: (brightness: number) => void
  setEnvironmentScene: (environmentScene: EnvironmentScene) => void
  setBackdrop: (backdrop: BackdropMode) => void
  setCameraMode: (cameraMode: CameraMode) => void
  toggleViewPanel: () => void
}

const acceptedFormats: ModelFormat[] = ['glb', 'gltf', 'stl', 'obj']

export const useModelStore = create<ModelStore>((set, get) => ({
  activeModelUrl: null,
  assetUrls: {},
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
  lighting: 'studio',
  brightness: 1,
  environmentScene: 'studio',
  backdrop: 'paper',
  cameraMode: 'perspective',
  isViewPanelOpen: false,
  metrics: null,
  cameraRevision: 0,
  loadFile: (file) => get().loadFiles([file]),
  loadFiles: (files) => {
    const model = files.find((file) => acceptedFormats.includes(file.name.split('.').pop()?.toLowerCase() as ModelFormat))
    const extension = model?.name.split('.').pop()?.toLowerCase() as ModelFormat | undefined
    if (!model || !extension) {
      set({ error: 'Unsupported format. Use GLB, GLTF, STL, or OBJ.' })
      return
    }
    const previousUrl = get().activeModelUrl
    if (previousUrl) Object.values(get().assetUrls).forEach((url) => URL.revokeObjectURL(url))
    const assetUrls = files.reduce<Record<string, string>>((urls, file) => {
      const url = URL.createObjectURL(file)
      urls[file.name] = url
      if (file.webkitRelativePath) urls[file.webkitRelativePath.replace(/\\/g, '/')] = url
      return urls
    }, {})
    set({
      activeModelUrl: assetUrls[model.name], assetUrls, fileName: model.name, format: extension,
      isLoading: true, error: null, metrics: null,
    })
  },
  clearModel: () => {
    const previousUrl = get().activeModelUrl
    if (previousUrl) Object.values(get().assetUrls).forEach((url) => URL.revokeObjectURL(url))
    set({ activeModelUrl: null, assetUrls: {}, fileName: null, format: null, isLoading: false, error: null, metrics: null })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setPreset: (preset) => set({ preset }),
  setMaterial: (values) => set(values),
  setMetrics: (metrics) => set({ metrics }),
  resetCamera: () => set((state) => ({ cameraRevision: state.cameraRevision + 1 })),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  setLighting: (lighting) => set({ lighting }),
  setBrightness: (brightness) => set({ brightness }),
  setEnvironmentScene: (environmentScene) => set({ environmentScene }),
  setBackdrop: (backdrop) => set({ backdrop }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  toggleViewPanel: () => set((state) => ({ isViewPanelOpen: !state.isViewPanelOpen })),
}))
