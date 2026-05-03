// apps/web/components/audio/SoundEffects.ts
import { Howl } from 'howler'

// In a real app these would be actual mp3/wav files in public/sounds/
// We'll use Howler synthetic/empty sounds as fallbacks to prevent errors if files are missing.
export const SOUNDS = {
  // Ambient drone that loops while playing
  templeDrone: new Howl({
    src: ['/sounds/temple_drone.mp3'],
    loop: true,
    volume: 0.3,
    preload: true,
    html5: true, // For large audio files
    onloaderror: () => {}, // Silence missing asset warnings for now
  }),

  // Heavy stone UI click
  stoneClick: new Howl({
    src: ['/sounds/stone_click.mp3'],
    volume: 0.5,
    preload: true,
    onloaderror: () => {},
  }),

  // Anvil strike for forging
  anvilStrike: new Howl({
    src: ['/sounds/anvil_strike.mp3'],
    volume: 0.6,
    preload: true,
    onloaderror: () => {},
  }),

  // Battle combat swoosh
  swordClash: new Howl({
    src: ['/sounds/sword_clash.mp3'],
    volume: 0.4,
    preload: true,
    onloaderror: () => {},
  }),

  // Heavenly choir for rank up / apotheosis
  apotheosis: new Howl({
    src: ['/sounds/apotheosis.mp3'],
    volume: 0.6,
    preload: true,
    onloaderror: () => {},
  })
}

export const playSound = (soundName: keyof typeof SOUNDS) => {
  try {
    SOUNDS[soundName].play()
  } catch (err) {
    console.error(`Failed to play sound: ${soundName}`, err)
  }
}

export const stopSound = (soundName: keyof typeof SOUNDS) => {
  try {
    SOUNDS[soundName].stop()
  } catch (err) {
    console.error(`Failed to stop sound: ${soundName}`, err)
  }
}
