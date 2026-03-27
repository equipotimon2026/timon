"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { riasecSections, riasecLabels } from "@/lib/questionnaires/riasec-questions"

type SectionKey = "personality" | "habilidades" | "intereses" | "motivaciones"

type RIASECResponse = {
  [key in SectionKey]: {
    R: string[]; I: string[]; A: string[]; S: string[]; E: string[]; C: string[]
  }
}

const sectionTitles = {
  personality: "1. Caracteristicas de Personalidad",
  habilidades: "2. Habilidades",
  intereses: "3. Intereses",
  motivaciones: "4. Motivaciones",
}

interface RIASECFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
}

export function RIASECForm({ userId, onComplete, onSave }: RIASECFormProps) {
  const [currentSection, setCurrentSection] = useState<SectionKey>("personality")
  const [responses, setResponses] = useState<RIASECResponse>({
    personality: { R: [], I: [], A: [], S: [], E: [], C: [] },
    habilidades: { R: [], I: [], A: [], S: [], E: [], C: [] },
    intereses: { R: [], I: [], A: [], S: [], E: [], C: [] },
    motivaciones: { R: [], I: [], A: [], S: [], E: [], C: [] },
  })
  const [isSaving, setIsSaving] = useState(false)

  const sections: SectionKey[] = ["personality", "habilidades", "intereses", "motivaciones"]
  const currentSectionIndex = sections.indexOf(currentSection)
  const progress = ((currentSectionIndex + 1) / sections.length) * 100

  const toggleItem = (column: "R" | "I" | "A" | "S" | "E" | "C", item: string) => {
    setResponses((prev) => {
      const columnArray = prev[currentSection][column]
      const newArray = columnArray.includes(item) ? columnArray.filter((i) => i !== item) : [...columnArray, item]

      return {
        ...prev,
        [currentSection]: {
          ...prev[currentSection],
          [column]: newArray,
        },
      }
    })
  }

  const currentData = riasecSections[currentSection]

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const questions: string[] = ["personality", "habilidades", "intereses", "motivaciones"]

      await onSave(0, responses, {
        totalSections: sections.length,
        section: "riasec"
      })

      onComplete()
    } catch (error) {
      console.error("Error saving RIASEC responses:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormComplete = () => {
    return sections.every(section => {
      const sectionData = responses[section]
      return Object.values(sectionData).some(array => array.length > 0)
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">II. Intereses y Aptitudes Vocacionales (RIASEC - HOLLAND)</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Modelo de John Holland. Tipologias: Realista (R), Investigador (I), Artistico (A), Social (S), Emprendedor
              (E), Convencional (C).
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium">Consigna:</p>
            <p className="mt-1 text-sm text-muted-foreground">
              En cada subseccion, marque con cuales palabras o frases se siente identificado.
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-primary">
                Seccion {currentSectionIndex + 1} de {sections.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Current Section */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-bold">{sectionTitles[currentSection]}</h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(currentData) as Array<"R" | "I" | "A" | "S" | "E" | "C">).map((column) => (
            <div key={column} className="space-y-4 rounded-lg border bg-card p-4">
              <h4 className="text-center text-sm font-semibold text-primary">
                {column} - {riasecLabels[column]}
              </h4>
              <div className="space-y-3">
                {currentData[column].map((item) => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={responses[currentSection][column].includes(item)}
                      onCheckedChange={() => toggleItem(column, item)}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-relaxed group-hover:text-primary transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentSectionIndex === 0}
            onClick={() => setCurrentSection(sections[currentSectionIndex - 1])}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">{sectionTitles[currentSection]}</span>
          {currentSectionIndex === sections.length - 1 ? (
            <Button
              onClick={handleSave}
              disabled={!isFormComplete() || isSaving}
              className="min-w-[100px]"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={currentSectionIndex === sections.length - 1}
              onClick={() => setCurrentSection(sections[currentSectionIndex + 1])}
            >
              Siguiente
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
