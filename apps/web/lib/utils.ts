// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Archetype, Rank } from './store'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatElo(elo: number): string {
  return elo.toLocaleString()
}

export function getArchetypeColor(archetype: Archetype): string {
  const map: Record<Archetype, string> = {
    Strategist: 'text-sky border-sky/30',
    Oracle:     'text-questa border-questa/30',
    Berserker:  'text-hadria border-hadria/30',
    Diplomat:   'text-olivine border-olivine/30',
  }
  return map[archetype] ?? 'text-sand border-sand/30'
}

export function getArchetypeGlow(archetype: Archetype): string {
  const map: Record<Archetype, string> = {
    Strategist: 'shadow-[0_0_20px_rgba(133,211,242,0.15)]',
    Oracle:     'shadow-[0_0_20px_rgba(122,96,112,0.2)]',
    Berserker:  'shadow-[0_0_20px_rgba(139,58,58,0.2)]',
    Diplomat:   'shadow-[0_0_20px_rgba(154,170,96,0.15)]',
  }
  return map[archetype] ?? ''
}

export function getRankClass(rank: Rank): string {
  const map: Record<Rank, string> = {
    Demigod:  'rank-demigod',
    Hero:     'rank-hero',
    God:      'rank-god',
    Titan:    'rank-titan',
    Olympian: 'rank-olympian',
  }
  return map[rank] ?? 'rank-demigod'
}

export function winRate(wins: number, losses: number): number {
  const total = wins + losses
  return total === 0 ? 0 : Math.round((wins / total) * 100)
}

export const ARCHETYPE_ICONS: Record<Archetype, string> = {
  Strategist: '⚔️',
  Oracle:     '🔮',
  Berserker:  '🔥',
  Diplomat:   '🕊️',
}

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  Strategist: 'Cold logic. Calculates every move with perfect rationality.',
  Oracle:     'Pattern seeker. Predicts with uncanny foresight.',
  Berserker:  'Chaotic power. Overwhelms with raw confidence.',
  Diplomat:   'Social mastery. Persuades, adapts, and outlasts.',
}
