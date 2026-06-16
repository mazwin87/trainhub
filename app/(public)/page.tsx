import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Check, Star, Search, Users, ShieldCheck, MessageCircle, Plus,
} from 'lucide-react'
import { FoundingTrainerForm } from '@/components/FoundingTrainerForm'

export const metadata: Metadata = {
  title: 'TrainHub — The HRD Corp-Claimable Training Marketplace',
  description:
    'An independent marketplace connecting Malaysian employers with verified, HRD Corp-claimable corporate trainers. We’re onboarding our founding cohort now.',
}

/* ── Static content ────────────────────────────────────────── */

const WHY = [
  {
    Icon: Search,
    title: 'Opaque & slow',
    body: 'Finding the right trainer means weeks of back-and-forth, with little visibility into who’s genuinely good or what they charge.',
  },
  {
    Icon: Users,
    title: 'Hard to get found',
    body: 'Great trainers and providers rely on word of mouth, so the companies who need them often never find them.',
  },
  {
    Icon: ShieldCheck,
    title: 'Claims left on the table',
    body: 'HRD Corp levy goes unused because teams aren’t sure which trainers and programmes are claimable.',
  },
]

const STEPS = [
  {
    num: '1',
    title: 'Trainers list free',
    body: 'Create a verified profile with your topics, certifications, rate and availability — keep it as your own shareable page.',
  },
  {
    num: '2',
    title: 'Employers search',
    body: 'L&D teams filter by topic, state, language and budget, then compare verified trainers side by side.',
  },
  {
    num: '3',
    title: 'Connect directly',
    body: 'They message you on WhatsApp and book directly — simple, transparent, and fully HRD Corp claimable.',
  },
]

const BENEFITS = [
  { title: 'Free, forever-free founding plan', sub: 'No listing fee and no commission on the bookings you win.' },
  { title: 'Be first in your category', sub: 'Early profiles get a “Founding Trainer” badge and top placement.' },
  { title: 'Leads straight to your WhatsApp', sub: 'Employers contact you directly — you own the relationship.' },
  { title: 'Help shape the product', sub: 'Founding trainers get a direct line to us and a say in what we build.' },
]

const CATEGORIES = [
  'Leadership', 'AI & Data', 'Health & Safety', 'Sales & Marketing', 'Audit & Compliance',
  'Sustainability & ESG', 'Communication', 'Human Resources', 'Finance', 'Strategy',
  'Personal Development', 'Procurement', 'Operations', 'Mental Health',
]

const FAQ = [
  {
    q: 'Is the platform live yet?',
    a: 'Not publicly — we’re in early access. Right now we’re hand-onboarding our first cohort of founding trainers. Apply above and you’ll be first in.',
  },
  {
    q: 'What does it cost trainers?',
    a: 'Nothing. Founding trainers get a forever-free plan with no listing fee and no commission on bookings. We’ll introduce optional paid features later, but the founding plan stays free.',
  },
  {
    q: 'How do you verify trainers?',
    a: 'We review each application — checking certifications, experience and references before a profile goes live. As the marketplace grows, employer ratings and reviews will add another layer of trust.',
  },
  {
    q: 'Is the training really HRD Corp claimable?',
    a: 'Many programmes are claimable under the HRD Corp levy, subject to scheme eligibility and your company’s status. We’re an independent marketplace, not HRD Corp — we’ll help you see what’s likely eligible, but final approval rests with HRD Corp.',
  },
]

/* ── Page ──────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────── */}
      <header className="lp-hero">
        <div className="lp-wrap lp-hero-grid">
          <div>
            <span className="lp-pill">
              <span className="lp-dotwrap"><span className="lp-dot" />Now onboarding</span>
              Founding trainers · Malaysia
            </span>
            <h1 className="lp-h1">
              The home for <span className="lp-accent">HRD Corp-claimable</span> corporate trainers.
            </h1>
            <p className="lp-lead">
              We’re building a simple, honest marketplace where Malaysian employers find verified
              trainers — and great trainers get discovered. We’re signing up our first cohort now.
            </p>
            <div className="lp-hero-cta">
              <Link className="lp-btn lp-btn-pri" href="#trainers">Become a founding trainer</Link>
              <Link className="lp-btn lp-btn-ghost" href="/trainers">Preview the directory</Link>
            </div>
            <div className="lp-ticks">
              {['Free to list', 'No commission', 'HRD Corp claimable'].map(t => (
                <span key={t} className="lp-tick">
                  <span className="lp-tick-c"><Check size={12} strokeWidth={2.6} /></span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Sample profile card */}
          <div className="lp-hero-visual">
            <span className="lp-sample-tag">Sample profile</span>
            <div className="lp-profile">
              <div className="lp-pf-head">
                <div className="lp-pf-ava">YN</div>
                <div>
                  <div className="lp-pf-name">Your Name Here</div>
                  <div className="lp-pf-role">Leadership &amp; Team Development Trainer</div>
                </div>
              </div>
              <div className="lp-pf-badges">
                <span className="lp-pf-bdg lp-pf-bdg-v"><Check size={13} strokeWidth={2.6} /> HRDC Verified</span>
                <span className="lp-pf-bdg lp-pf-bdg-t"><Star size={12} fill="currentColor" strokeWidth={0} /> Founding Trainer</span>
              </div>
              <div className="lp-pf-stats">
                <div className="lp-pf-stat"><div className="lp-pf-n">Your topics</div><div className="lp-pf-l">Up to 6</div></div>
                <div className="lp-pf-stat"><div className="lp-pf-n">Your rate</div><div className="lp-pf-l">You set it</div></div>
                <div className="lp-pf-stat"><div className="lp-pf-n">Direct</div><div className="lp-pf-l">WhatsApp leads</div></div>
              </div>
              <div className="lp-pf-foot">
                <div className="lp-pf-price">RM —<small> /day</small></div>
                <span className="lp-pf-wa"><MessageCircle size={15} strokeWidth={2} /> WhatsApp</span>
              </div>
              <div className="lp-pf-float">
                <span className="lp-pf-float-ic"><Star size={18} strokeWidth={1.9} /></span>
                <div>
                  <div className="lp-pf-float-t">Be one of our</div>
                  <div className="lp-pf-float-b">first 50 trainers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── WHY WE’RE BUILDING THIS ───────────────────────── */}
      <section className="lp-blk lp-why-blk">
        <div className="lp-wrap">
          <span className="lp-eyebrow">Why we’re building this</span>
          <h2 className="lp-sec">Finding the right trainer is harder than it should be.</h2>
          <div className="lp-why-grid">
            {WHY.map(({ Icon, title, body }) => (
              <div key={title} className="lp-why">
                <span className="lp-why-ic"><Icon size={24} strokeWidth={1.8} /></span>
                <h3 className="lp-why-h">{title}</h3>
                <p className="lp-why-p">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="lp-blk" id="how">
        <div className="lp-wrap">
          <span className="lp-eyebrow">How it will work</span>
          <h2 className="lp-sec">Simple for both sides.</h2>
          <div className="lp-steps">
            {STEPS.map(({ num, title, body }) => (
              <div key={num} className="lp-step">
                <div className="lp-step-num">{num}</div>
                <h3 className="lp-step-h">{title}</h3>
                <p className="lp-step-p">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDING TRAINER BAND ─────────────────────────── */}
      <section className="lp-found-band" id="trainers">
        <div className="lp-wrap">
          <div className="lp-fb-card">
            <div className="lp-fb-top">
              <div>
                <span className="lp-eyebrow lp-eyebrow-on-clay">For trainers</span>
                <h2 className="lp-fb-h">Become a founding trainer.</h2>
                <p className="lp-fb-lead">
                  We’re hand-onboarding our first 50 trainers. Get listed before anyone else, and
                  help shape how the platform works.
                </p>
              </div>
            </div>
            <div className="lp-fb-benefits">
              {BENEFITS.map(({ title, sub }) => (
                <div key={title} className="lp-fb-ben">
                  <span className="lp-fb-ben-c"><Check size={13} strokeWidth={2.6} /></span>
                  <div><b>{title}</b><span>{sub}</span></div>
                </div>
              ))}
            </div>
            <FoundingTrainerForm />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="lp-blk lp-cats-blk">
        <div className="lp-wrap">
          <span className="lp-eyebrow">Onboarding now</span>
          <h2 className="lp-sec">Trainers we’re looking for.</h2>
          <p className="lp-sec-lead">
            If you train in any of these areas, we’d love to have you in the founding cohort.
          </p>
          <div className="lp-cat-chips">
            {CATEGORIES.map(c => (
              <span key={c} className="lp-cat-chip">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="lp-faq-blk" id="faq">
        <div className="lp-wrap">
          <span className="lp-eyebrow">Questions</span>
          <h2 className="lp-sec">Good to know.</h2>
          <div className="lp-faq-list">
            {FAQ.map(({ q, a }, i) => (
              <details key={q} className="lp-faq" open={i === 0}>
                <summary>
                  {q}
                  <span className="lp-faq-ix"><Plus size={14} strokeWidth={2.4} /></span>
                </summary>
                <div className="lp-faq-ans">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
