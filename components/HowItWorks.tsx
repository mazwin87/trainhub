'use client'

import { useEffect, useRef } from 'react'
import { Search, BadgeCheck, MessageCircle, Check, ShieldCheck, Wallet } from 'lucide-react'
import { ScrollReveal, ScrollRevealGroup } from './ScrollReveal'

type StepDef = {
  num: string
  Icon: typeof Search
  title: string
  desc: string
}

const STEPS: StepDef[] = [
  {
    num: '01',
    Icon: Search,
    title: 'Discover Trainers',
    desc: 'Browse by topic, state, language, industry, and budget. Every trainer is HRDC-certified.',
  },
  {
    num: '02',
    Icon: BadgeCheck,
    title: 'Compare Expertise',
    desc: 'Review certifications, courses, ratings, testimonials, and experience.',
  },
  {
    num: '03',
    Icon: MessageCircle,
    title: 'Connect Instantly',
    desc: 'Send an enquiry or WhatsApp trainers directly. No middleman. No commission.',
  },
]

const TRUST: { Icon: typeof Check; label: string }[] = [
  { Icon: ShieldCheck,   label: 'HRDC Certified Trainers' },
  { Icon: BadgeCheck,    label: 'Verified Profiles' },
  { Icon: MessageCircle, label: 'Direct WhatsApp Contact' },
  { Icon: Wallet,        label: 'No Hidden Fees' },
]

export function HowItWorks() {
  return (
    <section className="hiw-section" aria-labelledby="how-it-works-heading">
      <div className="hiw-glow-top"   aria-hidden />
      <div className="hiw-glow-center" aria-hidden />

      <div className="hiw-container">
        {/* ── Heading ─────────────────────────────────────────── */}
        <ScrollReveal className="hiw-header">
          <span className="hiw-eyebrow">
            <span className="hiw-eyebrow-dot" />
            How it works
          </span>

          <h2 id="how-it-works-heading" className="hiw-heading">
            Find the Right Trainer in{' '}
            <span className="hiw-heading-accent">
              3 Simple Steps
              <svg
                className="hiw-heading-underline"
                viewBox="0 0 220 10"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 7 Q 60 1 110 5 T 218 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="hiw-subtitle">
            Search verified trainers, compare expertise, and connect directly — all in one place.
          </p>
        </ScrollReveal>

        {/* ── Cards + timeline ────────────────────────────────── */}
        <div className="hiw-cards-wrap">
          <TimelineConnector />

          <ScrollRevealGroup className="hiw-cards">
            {STEPS.map((step, i) => (
              <StepCard key={step.num} step={step} isLast={i === STEPS.length - 1} />
            ))}
          </ScrollRevealGroup>
        </div>

        {/* ── Trust indicators ────────────────────────────────── */}
        <ScrollReveal>
          <ul className="hiw-trust" aria-label="Trust indicators">
            {TRUST.map(({ label }) => (
              <li key={label} className="hiw-trust-item">
                <span className="hiw-trust-check" aria-hidden>
                  <Check size={12} strokeWidth={3} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */
function StepCard({ step, isLast }: { step: StepDef; isLast: boolean }) {
  const { num, Icon, title, desc } = step
  return (
    <div className="reveal">
      <div className="hiw-card">
        <span className="hiw-watermark" aria-hidden>{num}</span>

        <div className="hiw-icon-tile">
          <Icon size={28} strokeWidth={1.8} aria-hidden />
          <span className="hiw-icon-dot" aria-hidden />
        </div>

        <div className="hiw-step-label">
          <span className="hiw-step-rule" />
          Step {Number(num)}
        </div>

        <h3 className="hiw-card-title">{title}</h3>
        <p className="hiw-card-desc">{desc}</p>
      </div>

      {!isLast && (
        <div className="hiw-chevron-wrap" aria-hidden>
          <span className="hiw-chevron">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
function TimelineConnector() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-drawn')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-drawn')
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="hiw-timeline-wrap" aria-hidden>
      <svg
        ref={ref}
        className="hiw-timeline-svg"
        viewBox="0 0 1000 12"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hiw-timeline-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#C2410C" stopOpacity="0.18" />
            <stop offset="50%"  stopColor="#C2410C" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#C2410C" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          className="hiw-timeline-line"
          d="M 60 6 L 940 6"
          stroke="url(#hiw-timeline-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle className="hiw-timeline-dot hiw-timeline-dot-1" cx="333" cy="6" r="3" fill="#C2410C" />
        <circle className="hiw-timeline-dot hiw-timeline-dot-2" cx="666" cy="6" r="3" fill="#C2410C" />
      </svg>
    </div>
  )
}
