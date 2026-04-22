"use client"

import { useEffect, useState } from 'react'
import { VocationalJourney } from '@/components/journey/vocational-journey'

export function ResultsView() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/assessments/latest')
        const data = await res.json()
        if (data.assessment?.results) {
          setResults(data.assessment.results)
        }
      } catch (err) {
        console.error('Error fetching results:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <VocationalJourney results={results} />
}
