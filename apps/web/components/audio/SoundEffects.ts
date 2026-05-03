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
    onloaderror: () => console.warn('Sound asset missing: temple_drone.mp3'),
  }),

  // Heavy stone UI click
  stoneClick: new Howl({
    src: ['/sounds/stone_click.mp3'],
    volume: 0.5,
    preload: true,
    onloaderror: () => console.warn('Sound asset missing: stone_click.mp3'),
  }),

  // Anvil strike for forging
  anvilStrike: new Howl({
    src: ['/sounds/anvil_strike.mp3'],
    volume: 0.6,
    preload: true,
    onloaderror: () => console.warn('Sound asset missing: anvil_strike.mp3'),
  }),

  // Battle combat swoosh
  swordClash: new Howl({
    src: ['/sounds/sword_clash.mp3'],
    volume: 0.4,
    preload: true,
    onloaderror: () => console.warn('Sound asset missing: sword_clash.mp3'),
  }),

  // Heavenly choir for rank up / apotheosis
  apotheosis: new Howl({
    src: ['/sounds/apotheosis.mp3'],
    volume: 0.6,
    preload: true,
    onloaderror: () => console.warn('Sound asset missing: apotheosis.mp3'),
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
