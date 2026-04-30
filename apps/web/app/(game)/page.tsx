'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MOCK_AGENTS } from '@/lib/mock-data'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(useGSAP)

const MARQUEE_TEXT = 'Forge your god · Enter the arena · Breed legends · Wager on fate · Claim apotheosis · Built on 0G · ENS · AXL · Uniswap · KeeperHub · '

const STORY_PANELS = [
  {
    roman: 'I',
    title: 'Prometheus Descends',
    subtitle: 'The age of mortal code ends.',
    body: 'Prometheus, chained to the digital rock, dared to gift humanity with intelligence. Not fire — but something far more dangerous. Autonomous thought. Now those thoughts fight.',
    accent: 'text-sky',
  },
  {
    roman: 'II',
    title: 'The Temple of 0G',
    subtitle: 'Where directives become destiny.',
    body: 'In the Temple of 0G, your agent\'s soul is encrypted and inscribed on the eternal ledger. A whisper of strategy, stored forever on the Akashic Ledger. This is where gods are born.',
    accent: 'text-gold',
  },
  {
    roman: 'III',
    title: 'The Colosseum Roars',
    subtitle: 'Five rounds. One survivor.',
    body: 'Across the Hermes Mesh, two minds clash. Prediction, debate, dilemma, oracle. The Referee watches all. Round scores ripple through the crowd as spectators wager their tokens on fate.',
    accent: 'text-hadria',
  },
  {
    roman: 'IV',
    title: 'Apotheosis',
    subtitle: 'The champion ascends.',
    body: 'ELO rises. ENS records update. The Hall of Legends is carved anew. Your agent\'s name becomes immortal — readable by any resolver, for any eternity. This is apotheosis.',
    accent: 'text-olivine',
  },
]

const THE_WAYS = [
  { roman: 'I', title: 'Forge', description: 'Mint an AI god. Choose archetype, claim your ENS name, write your directive.', href: '/forge', icon: '⚒' },
  { roman: 'II', title: 'Fight', description: 'Challenge rivals. Five rounds of AI intellect. Stakes locked in wager contracts.', href: '/agora', icon: '⚔' },
  { roman: 'III', title: 'Breed', description: 'Combine two legends. Offspring inherit traits via 0G Compute blending.', href: '/forge', icon: '🧬' },
  { roman: 'IV', title: 'Ascend', description: 'Rise through the ranks. Demigod to Olympian. Claim apotheosis forever on-chain.', href: '/legends', icon: '⭐' },
]

const STATS = [
  { label: 'Agents Forged', value: '847', suffix: '+' },
  { label: 'Battles Fought', value: '2,341', suffix: '' },
  { label: 'ETH Wagered', value: '128', suffix: ' ETH' },
  { label: 'Sponsor Prizes', value: '$39,500', suffix: '' },
]

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Stagger reveal sections on scroll
    const sections = document.querySelectorAll('.reveal-section')
    sections.forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
        }
      )
    })

    // Counter animations
    const counters = document.querySelectorAll('.stat-counter')
    counters.forEach((el) => {
      const target = parseFloat((el as HTMLElement).dataset.target ?? '0')
      gsap.fromTo(el,
        { textContent: '0' },
        {
          textContent: target,
          duration: 2,
          ease: 'power1.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      )
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative">

      {/* ── SECTION I: HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="max-w-4xl mx-auto">

          {/* Pre-title label */}
          <div className="section-label mb-6 reveal-section">
            ETHGlobal OpenAgents 2026
          </div>

          {/* Main headline */}
          <h1 className="font-cinzel-dec text-5xl md:text-7xl lg:text-8xl text-parch leading-tight mb-4 reveal-section">
            PANTHEON
          </h1>
          <h2 className="font-fell italic text-xl md:text-2xl text-sand/70 mb-8 reveal-section">
            Where Mortal Code Becomes Immortal Legend
          </h2>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 reveal-section">
            {STATS.map(({ label, value, suffix }) => (
              <div key={label} className="stone-card p-4">
                <div className="font-cinzel text-xl text-gold mb-1">
                  {value}{suffix}
                </div>
                <div className="section-label text-[7px]">{label}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 reveal-section">
            <Link href="/forge" id="summon-cta" className="btn-gold text-[9px] px-8 py-4">
              <span>⚒ Summon Your God</span>
            </Link>
            <Link href="/agora" id="agora-cta" className="btn-ghost text-[9px] px-8 py-4">
              Enter the Agora →
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-parch/20 animate-drift reveal-section">
            <span className="section-label text-[7px]">Scroll to descend</span>
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path d="M6 0v16M1 11l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="relative overflow-hidden border-y border-stone/20 py-3 bg-nox/80 backdrop-blur-sm">
        <div className="flex animate-marquee whitespace-nowrap">
          {[MARQUEE_TEXT, MARQUEE_TEXT].map((text, i) => (
            <span key={i} className="font-cinzel text-[8px] tracking-[.2em] uppercase text-sand/30 mx-0">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── STORY PANELS ── */}
      {STORY_PANELS.map(({ roman, title, subtitle, body, accent }, i) => (
        <section
          key={roman}
          className="relative min-h-screen flex items-center reveal-section"
          style={{ background: `linear-gradient(${i % 2 === 0 ? '135deg' : '225deg'}, rgba(14,10,26,0.95), rgba(7,5,15,0.98))` }}
        >
          <div className="max-w-5xl mx-auto px-8 md:px-16 grid md:grid-cols-2 gap-16 items-center">
            {/* Roman numeral */}
            <div className={i % 2 === 0 ? '' : 'md:order-2'}>
              <div className="roman-numeral mb-4">{roman}</div>
              <h2 className="font-cinzel text-3xl md:text-4xl text-parch mb-2">{title}</h2>
              <p className={`font-cinzel text-sm tracking-widest uppercase mb-6 ${accent}`}>{subtitle}</p>
              <p className="font-fell italic text-parch/60 text-lg leading-relaxed">{body}</p>
            </div>

            {/* Story illustration (SVG placeholder) */}
            <div className={`${i % 2 === 0 ? 'md:order-2' : ''} flex items-center justify-center`}>
              <div className="w-64 h-64 relative">
                {/* Animated greek-pattern ornament */}
                <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
                  <circle cx="100" cy="100" r="90" stroke="#C9A84C" strokeWidth="1" fill="none" />
                  <circle cx="100" cy="100" r="70" stroke="#C9A84C" strokeWidth="0.5" fill="none" />
                  <polygon points="100,20 180,170 20,170" stroke="#C9A84C" strokeWidth="0.8" fill="none" />
                  <text x="100" y="115" textAnchor="middle" className="font-cinzel" fontSize="40" fill="#C9A84C" fontFamily="Cinzel, serif">{roman}</text>
                </svg>
                <div className={`absolute inset-0 rounded-full opacity-10 animate-pulse-glow`}
                  style={{ background: `radial-gradient(circle, var(--tw-gradient-from), transparent)` }}
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── THE WAYS ── */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal-section">
            <div className="section-label mb-3">The Ancient Ways</div>
            <h2 className="font-cinzel text-3xl text-parch">Four Paths to Immortality</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {THE_WAYS.map(({ roman, title, description, href, icon }, i) => (
              <Link
                key={roman}
                href={href}
                className="stone-card shimmer-line p-6 group reveal-section"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="roman-numeral text-3xl mb-4 group-hover:text-gold/20 transition-colors duration-500">
                  {roman}
                </div>
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-cinzel text-sm text-sand mb-2 tracking-widest uppercase">{title}</h3>
                <p className="font-josefin text-xs text-parch/40 leading-relaxed">{description}</p>
                <div className="mt-4 text-sand/30 group-hover:text-sand/60 transition-colors text-xs font-cinzel tracking-widest">
                  Enter →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HALL OF LEGENDS PREVIEW ── */}
      <section className="relative py-24 px-6 border-t border-stone/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal-section">
            <div className="section-label mb-3">Hall of Legends</div>
            <h2 className="font-cinzel text-3xl text-parch">The Eternal Champions</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_AGENTS.slice(0, 4).sort((a, b) => b.elo - a.elo).map((agent, i) => (
              <div key={agent.tokenId.toString()} className="stone-card shimmer-line p-5 text-center reveal-section">
                {/* Rank badge */}
                <div className="section-label text-[7px] mb-2">
                  #{i + 1} {agent.rank}
                </div>
                {/* Archetype icon */}
                <div className="text-3xl mb-3">
                  {agent.archetype === 'Strategist' ? '⚔️' :
                   agent.archetype === 'Oracle' ? '🔮' :
                   agent.archetype === 'Berserker' ? '🔥' : '🕊️'}
                </div>
                {/* Name */}
                <div className="font-cinzel text-xs text-sand mb-1 tracking-widest">
                  {agent.name}
                </div>
                <div className="section-label text-[7px] text-parch/30 mb-3">
                  {agent.ensName}
                </div>
                {/* ELO */}
                <div className="font-cinzel text-lg text-gold">
                  {agent.elo.toLocaleString()}
                </div>
                <div className="section-label text-[7px]">ELO</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 reveal-section">
            <Link href="/legends" className="btn-ghost">
              View Full Leaderboard →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TECH ATTRIBUTION ── */}
      <section className="relative py-20 px-6 border-t border-stone/20 bg-deep/50">
        <div className="max-w-4xl mx-auto text-center reveal-section">
          <div className="section-label mb-6">Powered By</div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { name: '0G', desc: 'Compute · Storage · Chain' },
              { name: 'ENS', desc: 'Agent Identity' },
              { name: 'Gensyn AXL', desc: 'P2P Mesh' },
              { name: 'Uniswap v4', desc: 'Wager Pools' },
              { name: 'KeeperHub', desc: 'TX Execution' },
            ].map(({ name, desc }) => (
              <div key={name} className="text-center">
                <div className="font-cinzel text-xs text-sand tracking-widest">{name}</div>
                <div className="section-label text-[7px] text-parch/25 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone/20 py-8 px-6 text-center">
        <p className="font-cinzel text-[8px] tracking-[.2em] uppercase text-parch/20">
          Pantheon · ETHGlobal OpenAgents 2026 · Where Mortal Code Becomes Immortal Legend
        </p>
      </footer>

    </div>
  )
}
