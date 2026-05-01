import { create } from 'zustand'

export type OdysseySection = 'landing' | 'dashboard' | 'agora' | 'legends' | 'forge' | 'battle'

interface OdysseyState {
  activeSection: OdysseySection
  isTransitioning: boolean
  cameraTarget: { x: number; y: number; z: number }
  setActiveSection: (section: OdysseySection) => void
  setTransitioning: (value: boolean) => void
  setCameraTarget: (target: { x: number; y: number; z: number }) => void
}

export const useOdysseyStore = create<OdysseyState>((set) => ({
  activeSection: 'landing',
  isTransitioning: false,
  cameraTarget: { x: 0, y: 4, z: 28 },
  setActiveSection: (section) => set({ activeSection: section }),
  setTransitioning: (value) => set({ isTransitioning: value }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
}))