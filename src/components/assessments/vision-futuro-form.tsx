"use client"

import React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { visionFuturoData } from "@/lib/questionnaires/vision-futuro-questions"

type VisionFuturoResponse = {
  visualizaciones: { [key: string]: string }
  lugarFantaseado: { [key: string]: string }
  preguntasProfundidad: { [key: string]: string }
}

interface VisionFuturoFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
}

export function VisionFuturoForm({ userId, onComplete, onSave }: VisionFuturoFormProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [responses, setResponses] = useState<VisionFuturoResponse>({
    visualizaciones: {},
    lugarFantaseado: {},
    preguntasProfundidad: {},
  })

  const sections = [
    { id: "visualizaciones", title: "Visualizaciones" },
    { id: "lugarFantaseado", title: "Lugar Fantaseado Ocupacional" },
    { id: "preguntasProfundidad", title: "Preguntas de Profundidad" },
  ]

  const progress = ((currentSection + 1) / sections.length) * 100

  const isSectionComplete = (sectionIndex: number) => {
    if (sectionIndex === 0) return Object.values(responses.visualizaciones).some(text => text && text.trim() !== "")
    if (sectionIndex === 1) return Object.values(responses.lugarFantaseado).some(text => text && text.trim() !== "")
    if (sectionIndex === 2) return Object.values(responses.preguntasProfundidad).some(text => text && text.trim() !== "")
    return false
  }

  const isFormComplete = () => sections.every((_, index) => isSectionComplete(index))

  const handleSave = async () => {
    if (!isFormComplete()) return
    setIsSaving(true)
    try {
      const formattedResponses: any[] = []
      let questionNumber = 1

      if (Object.keys(responses.visualizaciones).length > 0) {
        const visualizacionesJson: Record<string, string> = {}
        Object.entries(responses.visualizaciones).forEach(([itemId, response]) => {
          const item = visionFuturoData.visualizaciones.find(v => v.id === itemId)
          if (item && response && response.trim() !== "") visualizacionesJson[item.description] = response
        })
        if (Object.keys(visualizacionesJson).length > 0) { formattedResponses.push({ questionNumber, question: "Visualizaciones", responseText: JSON.stringify(visualizacionesJson) }); questionNumber++ }
      }

      if (Object.keys(responses.lugarFantaseado).length > 0) {
        const lugarJson: Record<string, string> = {}
        Object.entries(responses.lugarFantaseado).forEach(([itemId, response]) => {
          const item = visionFuturoData.lugarFantaseado.find(l => l.id === itemId)
          if (item && response && response.trim() !== "") lugarJson[item.description] = response
        })
        if (Object.keys(lugarJson).length > 0) { formattedResponses.push({ questionNumber, question: "Lugar Fantaseado Ocupacional", responseText: JSON.stringify(lugarJson) }); questionNumber++ }
      }

      if (Object.keys(responses.preguntasProfundidad).length > 0) {
        const preguntasJson: Record<string, string> = {}
        Object.entries(responses.preguntasProfundidad).forEach(([itemId, response]) => {
          const item = visionFuturoData.preguntasProfundidad.find(p => p.id === itemId)
          if (item && response && response.trim() !== "") preguntasJson[item.question] = response
        })
        if (Object.keys(preguntasJson).length > 0) { formattedResponses.push({ questionNumber, question: "Preguntas de Profundidad", responseText: JSON.stringify(preguntasJson) }) }
      }

      await onSave(0, formattedResponses, { totalSections: sections.length, section: "vision-futuro" })
      onComplete()
    } catch (error) {
      console.error("Error saving responses:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Vision de Futuro</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explora tu vision y aspiraciones futuras</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seccion</span>
              <span className="font-medium text-primary">{currentSection + 1} / {sections.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </Card>

      {currentSection === 0 && <VisualizacionesSection responses={responses} setResponses={setResponses} />}
      {currentSection === 1 && <LugarFantaseadoSection responses={responses} setResponses={setResponses} />}
      {currentSection === 2 && <PreguntasProfundidadSection responses={responses} setResponses={setResponses} />}

      <Card className="border-none bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={currentSection === 0} onClick={() => setCurrentSection((p) => p - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">{sections[currentSection].title}</span>
          {currentSection === sections.length - 1 ? (
            <Button onClick={handleSave} disabled={!isFormComplete() || isSaving} className="min-w-[100px]">{isSaving ? "Guardando..." : "Guardar"}</Button>
          ) : (
            <Button variant="ghost" onClick={() => setCurrentSection((p) => p + 1)} disabled={!isSectionComplete(currentSection)}>Siguiente</Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function VisualizacionesSection({ responses, setResponses }: { responses: VisionFuturoResponse; setResponses: React.Dispatch<React.SetStateAction<VisionFuturoResponse>> }) {
  const handleChange = (id: string, value: string) => { setResponses((prev) => ({ ...prev, visualizaciones: { ...prev.visualizaciones, [id]: value } })) }
  return (
    <div className="space-y-4">
      <Card className="border-none bg-card p-6 shadow-sm"><div className="space-y-2"><h3 className="text-lg font-semibold">Visualizaciones</h3><p className="text-sm text-muted-foreground">Imagina diferentes momentos de tu futuro y describi como te gustaria que fueran.</p></div></Card>
      {visionFuturoData.visualizaciones.map((item) => (
        <Card key={item.id} className="border-none bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <div><Label className="text-base font-semibold">{item.title}</Label><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>
            <Textarea value={responses.visualizaciones[item.id] || ""} onChange={(e) => handleChange(item.id, e.target.value)} placeholder="Escribi tu respuesta aqui..." className="min-h-[120px]" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function LugarFantaseadoSection({ responses, setResponses }: { responses: VisionFuturoResponse; setResponses: React.Dispatch<React.SetStateAction<VisionFuturoResponse>> }) {
  const handleChange = (id: string, value: string) => { setResponses((prev) => ({ ...prev, lugarFantaseado: { ...prev.lugarFantaseado, [id]: value } })) }
  return (
    <div className="space-y-4">
      <Card className="border-none bg-card p-6 shadow-sm"><div className="space-y-2"><h3 className="text-lg font-semibold">Lugar Fantaseado Ocupacional</h3><p className="text-sm text-muted-foreground">Describi los espacios donde te sentis comodo y como te imaginas tu lugar de trabajo ideal.</p></div></Card>
      {visionFuturoData.lugarFantaseado.map((item) => (
        <Card key={item.id} className="border-none bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <div><Label className="text-base font-semibold">{item.title}</Label><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>
            <Textarea value={responses.lugarFantaseado[item.id] || ""} onChange={(e) => handleChange(item.id, e.target.value)} placeholder="Escribi tu respuesta aqui..." className="min-h-[120px]" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function PreguntasProfundidadSection({ responses, setResponses }: { responses: VisionFuturoResponse; setResponses: React.Dispatch<React.SetStateAction<VisionFuturoResponse>> }) {
  const handleChange = (id: string, value: string) => { setResponses((prev) => ({ ...prev, preguntasProfundidad: { ...prev.preguntasProfundidad, [id]: value } })) }
  return (
    <div className="space-y-4">
      <Card className="border-none bg-card p-6 shadow-sm"><div className="space-y-2"><h3 className="text-lg font-semibold">Preguntas de Profundidad y Motivacion</h3><p className="text-sm text-muted-foreground">Responde estas preguntas con honestidad. No hay respuestas correctas o incorrectas, se trata de conocerte mejor.</p></div></Card>
      {visionFuturoData.preguntasProfundidad.map((item, index) => (
        <Card key={item.id} className="border-none bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
              <Label className="text-base leading-relaxed">{item.question}</Label>
            </div>
            <Textarea value={responses.preguntasProfundidad[item.id] || ""} onChange={(e) => handleChange(item.id, e.target.value)} placeholder="Escribi tu respuesta aqui..." className="min-h-[100px]" />
          </div>
        </Card>
      ))}
    </div>
  )
}
