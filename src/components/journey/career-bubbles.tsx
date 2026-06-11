"use client"
import { useEffect, useState } from "react"

interface Bubble { universityId: string; universityName: string; programName: string }

export function CareerBubbles({ programSearchGroup }: { programSearchGroup: string | null }) {
  const [bubbles, setBubbles] = useState<Bubble[] | null>(programSearchGroup ? null : [])
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!programSearchGroup) return
    let active = true
    fetch(`/api/universities/by-program-group?group=${encodeURIComponent(programSearchGroup)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (active) setBubbles(d.universities ?? []) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [programSearchGroup])

  if (!programSearchGroup || error) return null
  if (bubbles === null) return <div className="text-sm text-muted-foreground">Cargando universidades…</div>
  if (bubbles.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {bubbles.map((b) => (
        <span key={`${b.universityId}-${b.programName}`}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-secondary/40 border border-secondary text-foreground">
          <span className="font-medium">{b.universityName}</span>
          <span className="mx-1.5 text-muted-foreground">—</span>
          <span className="text-muted-foreground">{b.programName}</span>
        </span>
      ))}
    </div>
  )
}
