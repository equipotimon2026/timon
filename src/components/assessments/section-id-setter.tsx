"use client"

import { useEffect } from "react"

interface SectionIdSetterProps {
  sectionId: number
  onSectionChange?: (sectionId: number) => void
}

export function SectionIdSetter({ sectionId, onSectionChange }: SectionIdSetterProps) {
  useEffect(() => {
    if (onSectionChange) {
      onSectionChange(sectionId)
    }
  }, [sectionId, onSectionChange])

  return null
}
