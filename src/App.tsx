import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Box, FolderOpen, Moon, RotateCcw, Rotate3D, Sun, Upload, X } from 'lucide-react'
import { ModelScene } from './components/ModelScene'
import { useModelStore, type MaterialPreset } from './store/useModelStore'

const presets: { id: MaterialPreset; label: string; note: string }[] = [
  { id: 'original', label: 'Original', note: 'Embedded material' },
  { id: 'clay', label: 'Clay', note: 'Matte / 0.90 R' },
  { id: 'gloss', label: 'Gloss', note: 'Clearcoat / 0.80' },
  { id: 'metal', label: 'Brushed Metal', note: 'Aluminum / 0.95 M' },
  { id: 'wireframe', label: 'Wireframe', note: 'Technical lines' },
  { id: 'normals', label: 'Normals', note: 'Surface direction' },
]

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-baseline justify-between gap-6 border-b border-current/20 py-2 last:border-0">
    <span className="text-[9px] font-medium uppercase tracking-[0.16em] opacity-60">{label}</span>
    <span className="font-mono text-[10px] tabular-nums">{value}</span>
  </div>
}

function Loader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const loadFile = useModelStore((s) => s.loadFile)
  const fileName = useModelStore((s) => s.fileName)
  const clearModel = useModelStore((s) => s.clearModel)
  const isLoading = useModelStore((s) => s.isLoading)
  const error = useModelStore((s) => s.error)
  const select = (file?: File) => file && loadFile(file)
  const onChange = (event: ChangeEvent<HTMLInputElement>) => { select(event.target.files?.[0]); event.target.value = '' }
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); select(event.dataTransfer.files[0]) }

  return <section className="border-b border-current">
    <input ref={inputRef} className="hidden" type="file" accept=".glb,.gltf,.stl,.obj" onChange={onChange} />
    <div onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
      className={`m-4 border p-4 transition-none ${dragging ? 'bg-current text-white' : ''}`}>
      {fileName ? <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="truncate font-mono text-[11px]">{fileName}</p><p className="mt-1 text-[9px] uppercase tracking-[0.14em] opacity-60">{isLoading ? 'Loading geometry' : 'Local model loaded'}</p></div>
        <button onClick={clearModel} aria-label="Remove model" className="p-1"><X size={15} strokeWidth={1} /></button>
      </div> : <div>
        <Upload size={16} strokeWidth={1} />
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em]">Drop model file</p>
        <p className="mt-1 font-mono text-[9px] opacity-60">GLB / GLTF / STL / OBJ</p>
        <button onClick={() => inputRef.current?.click()} className="mt-4 flex items-center gap-2 border border-current px-2 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] hover:bg-current hover:text-white"><FolderOpen size={13} strokeWidth={1} /> Browse files</button>
      </div>}
    </div>
    {error && <p className="px-4 pb-3 font-mono text-[10px]">{error}</p>}
  </section>
}

function MaterialPanel() {
  const preset = useModelStore((s) => s.preset)
  const setPreset = useModelStore((s) => s.setPreset)
  const roughness = useModelStore((s) => s.roughness)
  const metalness = useModelStore((s) => s.metalness)
  const color = useModelStore((s) => s.color)
  const wireframeOverlay = useModelStore((s) => s.wireframeOverlay)
  const setMaterial = useModelStore((s) => s.setMaterial)
  return <section className="border-b border-current px-4 py-5">
    <h2 className="text-[10px] font-medium uppercase tracking-[0.16em]">Surface override</h2>
    <div className="mt-3 grid grid-cols-2 border-l border-t border-current">
      {presets.map((item) => <button key={item.id} onClick={() => setPreset(item.id)} className={`border-b border-r border-current p-2.5 text-left ${preset === item.id ? 'bg-current text-white' : 'hover:bg-neutral-100'}`}>
        <span className="block text-[10px] font-medium uppercase tracking-wide">{item.label}</span><span className="mt-1 block font-mono text-[8px] opacity-60">{item.note}</span>
      </button>)}
    </div>
    <div className="mt-6 space-y-5">
      <label className="block"><span className="mb-2 flex justify-between text-[9px] uppercase tracking-[0.14em]"><span>Roughness</span><span className="font-mono">{roughness.toFixed(2)}</span></span><input type="range" min="0" max="1" step="0.01" value={roughness} onChange={(e) => setMaterial({ roughness: Number(e.target.value) })} /></label>
      <label className="block"><span className="mb-2 flex justify-between text-[9px] uppercase tracking-[0.14em]"><span>Metalness</span><span className="font-mono">{metalness.toFixed(2)}</span></span><input type="range" min="0" max="1" step="0.01" value={metalness} onChange={(e) => setMaterial({ metalness: Number(e.target.value) })} /></label>
      <div className="flex items-end gap-2"><label className="flex-1"><span className="mb-2 block text-[9px] uppercase tracking-[0.14em]">Base color</span><input value={color} maxLength={7} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setMaterial({ color: e.target.value })} className="h-8 w-full border border-current bg-transparent px-2 font-mono text-[10px] uppercase outline-none" /></label><input aria-label="Select base color" type="color" value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#e0e0e0'} onChange={(e) => setMaterial({ color: e.target.value })} className="h-8 w-8 border border-current" /></div>
      <button onClick={() => setMaterial({ wireframeOverlay: !wireframeOverlay })} className="flex w-full items-center justify-between border border-current px-2 py-2 text-[9px] uppercase tracking-[0.14em]"><span>Wireframe overlay</span><span className={`h-2.5 w-2.5 border border-current ${wireframeOverlay ? 'bg-current' : ''}`} /></button>
    </div>
  </section>
}

function Sidebar() {
  const metrics = useModelStore((s) => s.metrics)
  const resetCamera = useModelStore((s) => s.resetCamera)
  const autoRotate = useModelStore((s) => s.autoRotate)
  const toggleAutoRotate = useModelStore((s) => s.toggleAutoRotate)
  const isDark = useModelStore((s) => s.isDark)
  const toggleTheme = useModelStore((s) => s.toggleTheme)
  return <aside className="flex h-full w-full shrink-0 flex-col border-l border-current bg-inherit md:w-80">
    <header className="flex h-14 items-center justify-between border-b border-current px-4"><div className="flex items-center gap-2"><Box size={16} strokeWidth={1} /><span className="text-[10px] font-medium uppercase tracking-[0.16em]">Model Sandbox</span></div><button onClick={toggleTheme} aria-label="Toggle color theme" className="p-1">{isDark ? <Sun size={15} strokeWidth={1} /> : <Moon size={15} strokeWidth={1} />}</button></header>
    <Loader />
    <MaterialPanel />
    <section className="px-4 py-5"><h2 className="text-[10px] font-medium uppercase tracking-[0.16em]">Diagnostics</h2><div className="mt-3"><Metric label="Vertices" value={(metrics?.vertices ?? 0).toLocaleString()} /><Metric label="Triangles" value={(metrics?.triangles ?? 0).toLocaleString()} /><Metric label="X × Y × Z" value={metrics ? metrics.dimensions.map((n) => n.toFixed(2)).join(' × ') : '—'} /></div></section>
    <div className="mt-auto grid grid-cols-2 border-t border-current"><button onClick={resetCamera} className="flex items-center justify-center gap-2 border-r border-current py-3 text-[9px] uppercase tracking-[0.14em] hover:bg-current hover:text-white"><RotateCcw size={14} strokeWidth={1} /> Recenter</button><button onClick={toggleAutoRotate} className={`flex items-center justify-center gap-2 py-3 text-[9px] uppercase tracking-[0.14em] ${autoRotate ? 'bg-current text-white' : 'hover:bg-neutral-100'}`}><Rotate3D size={14} strokeWidth={1} /> Rotate</button></div>
  </aside>
}

function Hud() {
  const metrics = useModelStore((s) => s.metrics)
  const fileName = useModelStore((s) => s.fileName)
  const isDark = useModelStore((s) => s.isDark)
  return <div className={`pointer-events-none absolute left-4 top-4 border px-3 py-2 font-mono text-[9px] leading-5 ${isDark ? 'border-[#e5e5e5] bg-[#0a0a0a] text-[#e5e5e5]' : 'border-black bg-white text-black'}`}>
    <div className="flex gap-4"><span>SCENE / 01</span><span>{fileName ? 'LOCAL' : 'SAMPLE'}</span></div>
    <div className="opacity-60">{metrics ? `${metrics.triangles.toLocaleString()} TRI / ${metrics.vertices.toLocaleString()} VTX` : 'ANALYZING'}</div>
  </div>
}

export default function App() {
  const isDark = useModelStore((s) => s.isDark)
  return <main className={`h-full ${isDark ? 'bg-[#0a0a0a] text-[#e5e5e5]' : 'bg-white text-black'}`}>
    <div className="flex h-full flex-col md:flex-row"><section className="relative min-h-[55vh] flex-1 md:min-h-0"><ModelScene /><Hud /><div className="pointer-events-none absolute bottom-4 left-4 text-[9px] uppercase tracking-[0.16em]">Orbit / scroll / pan</div></section><Sidebar /></div>
  </main>
}
