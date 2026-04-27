"use client"

import { useState } from "react"
import { ActCarreras } from "@/components/acts/act-carreras"
import { careersData, Career } from "@/lib/career-data"

/**
 * Temporary preview page for development/testing of the "Los Caminos" section.
 * This page bypasses auth and questionnaire requirements.
 * 
 * Access: /es/preview-caminos or /en/preview-caminos
 */
export default function PreviewCaminosPage() {
  const [currentChapter, setCurrentChapter] = useState<string>("carreras-lista")
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null)

  const handleSelectCareer = (career: Career) => {
    setSelectedCareer(career)
    setCurrentChapter("carreras-detalle")
  }

  const handleBack = () => {
    setSelectedCareer(null)
    setCurrentChapter("carreras-lista")
  }

  const handleNextChapter = () => {
    setCurrentChapter("carreras-lista")
  }

  const handleNavigateToUniversidades = () => {
    // No-op for preview - just log
    console.log("[v0] Navigate to universidades triggered (preview mode)")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dev banner */}
      <div className="sticky top-0 z-50 bg-amber-100 border-b border-amber-300 px-4 py-2">
        <p className="text-sm text-amber-800 text-center font-medium">
          Preview Mode — Esta página es solo para desarrollo de la branch career-name-variations
        </p>
      </div>

      <ActCarreras
        careers={careersData}
        currentChapter={currentChapter}
        selectedCareer={selectedCareer}
        onSelectCareer={handleSelectCareer}
        onBack={handleBack}
        onNextChapter={handleNextChapter}
        onNavigateToUniversidades={handleNavigateToUniversidades}
      />
    </div>
  )
}
