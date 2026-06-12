"use client"
import { useEffect, useMemo, useState } from "react"

interface Bubble { universityId: string; universityName: string; programName: string }

const PILL_COLORS = [
  "bg-violet-100 text-violet-800",
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-indigo-100 text-indigo-800",
  "bg-teal-100 text-teal-800",
]

const VISIBLE_LIMIT = 7

export function CareerBubbles({ programSearchGroup }: { programSearchGroup: string | null }) {
  const [bubbles, setBubbles] = useState<Bubble[] | null>(programSearchGroup ? null : [])
  const [error, setError] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!programSearchGroup) return
    let active = true
    fetch(`/api/universities/by-program-group?group=${encodeURIComponent(programSearchGroup)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (active) setBubbles(d.universities ?? []) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [programSearchGroup])

  // One pill per university (a uni may dictate the program under several names).
  const unis = useMemo(() => {
    if (!bubbles) return []
    const seen = new Set<string>()
    const out: Bubble[] = []
    for (const b of bubbles) {
      if (seen.has(b.universityId)) continue
      seen.add(b.universityId)
      out.push(b)
    }
    return out
  }, [bubbles])

  if (!programSearchGroup || error) return null
  if (bubbles === null) return <div className="text-sm text-muted-foreground">Cargando universidades…</div>
  if (unis.length === 0) return null

  const visible = showAll ? unis : unis.slice(0, VISIBLE_LIMIT)
  const hidden = unis.length - visible.length

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((b, idx) => (
        <span
          key={b.universityId}
          title={b.programName}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${PILL_COLORS[idx % PILL_COLORS.length]}`}
        >
          {b.universityName}
        </span>
      ))}
      {hidden > 0 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
        >
          +{hidden} más
        </button>
      )}
      {showAll && unis.length > VISIBLE_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
        >
          Ver menos
        </button>
      )}
    </div>
  )
}
