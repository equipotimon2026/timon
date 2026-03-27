"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { autodescubrimientoData } from "@/lib/questionnaires/autodescubrimiento-questions"

type AutodescubrimientoResponse = {
  intereses: Record<string, { talentos: string[]; noTalentos: string[] }>
  autobiografia: Record<string, string>
  estilosAprendizaje: Record<number, string>
  preguntasAbiertas: Record<string, string>
}

interface AutodescubrimientoFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any
  onResponseChange?: (responses: any) => void
}

export function AutodescubrimientoForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: AutodescubrimientoFormProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [responses, setResponses] = useState<AutodescubrimientoResponse>(initialResponses ?? {
    intereses: {},
    autobiografia: {},
    estilosAprendizaje: {},
    preguntasAbiertas: {},
  })

  useEffect(() => {
    onResponseChange?.(responses);
  }, [responses]);

  const sections = [
    { id: "intereses", title: "Explorando mis Intereses" },
    { id: "autobiografia", title: "Autobiografia" },
    { id: "estilosAprendizaje", title: "Estilos de Aprendizaje" },
  ]

  const progress = ((currentSection + 1) / sections.length) * 100

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formattedResponses: any[] = []
      let questionNumber = 1

      if (Object.keys(responses.intereses).length > 0) {
        formattedResponses.push({ questionNumber, question: "Explorando mis Intereses", responseText: JSON.stringify(responses.intereses) })
        questionNumber++
      }

      if (responses.autobiografia && Object.keys(responses.autobiografia).length > 0) {
        const autobiografiaJson: Record<string, string> = {}
        Object.entries(responses.autobiografia).forEach(([fieldId, response]) => {
          const field = autodescubrimientoData.autobiografiaFields.find(f => f.id === fieldId)
          if (field && response) autobiografiaJson[field.description] = response
        })
        if (Object.keys(autobiografiaJson).length > 0) {
          formattedResponses.push({ questionNumber, question: "Autobiografia", responseText: JSON.stringify(autobiografiaJson) })
          questionNumber++
        }
      }

      if (responses.estilosAprendizaje && Object.keys(responses.estilosAprendizaje).length > 0) {
        const estilosJson: Record<string, string> = {}
        Object.entries(responses.estilosAprendizaje).forEach(([questionIndex, response]) => {
          const question = autodescubrimientoData.estilosAprendizajePreguntas[parseInt(questionIndex)]
          if (question && response) estilosJson[question.question] = response
        })
        if (Object.keys(estilosJson).length > 0) {
          formattedResponses.push({ questionNumber, question: "Estilos de Aprendizaje", responseText: JSON.stringify(estilosJson) })
          questionNumber++
        }
      }

      if (responses.preguntasAbiertas && Object.keys(responses.preguntasAbiertas).length > 0) {
        const preguntasJson: Record<string, string> = {}
        Object.entries(responses.preguntasAbiertas).forEach(([questionId, response]) => {
          const question = autodescubrimientoData.preguntasAbiertas.find(q => q.id === questionId)
          if (question && response) preguntasJson[question.question] = response
        })
        if (Object.keys(preguntasJson).length > 0) {
          formattedResponses.push({ questionNumber, question: "Preguntas de Reflexion", responseText: JSON.stringify(preguntasJson) })
        }
      }

      await onSave(0, formattedResponses, { totalSections: sections.length, section: "autodescubrimiento" })
      onComplete()
    } catch (error) {
      console.error("Error saving Autodescubrimiento responses:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormComplete = () => {
    const hasIntereses = Object.keys(responses.intereses).some(key => {
      const area = responses.intereses[key]
      return area?.talentos?.length > 0 || area?.noTalentos?.length > 0
    })
    const hasAutobiografia = Object.values(responses.autobiografia || {}).some(text => text?.trim())
    const hasEstilos = Object.keys(responses.estilosAprendizaje || {}).length > 0
    return hasIntereses && hasAutobiografia && hasEstilos
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Auto-descubrimiento y Estilos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explora tus intereses, estilo y talentos</p>
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

      {currentSection === 0 && <InteresesSection responses={responses} setResponses={setResponses} setCurrentSection={setCurrentSection} />}
      {currentSection === 1 && <AutobiografiaSection responses={responses} setResponses={setResponses} setCurrentSection={setCurrentSection} />}
      {currentSection === 2 && <EstilosAprendizajeSection responses={responses} setResponses={setResponses} setCurrentSection={setCurrentSection} handleSave={handleSave} isSaving={isSaving} isFormComplete={isFormComplete} />}
    </div>
  )
}

function InteresesSection({ responses, setResponses, setCurrentSection }: {
  responses: AutodescubrimientoResponse
  setResponses: React.Dispatch<React.SetStateAction<AutodescubrimientoResponse>>
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>
}) {
  const [currentArea, setCurrentArea] = useState(0)
  const [phase, setPhase] = useState<"talentos" | "noTalentos">("talentos")
  const areaKeys = Object.keys(autodescubrimientoData.areas)
  const areaKey = areaKeys[currentArea]
  const area = autodescubrimientoData.areas[areaKey as keyof typeof autodescubrimientoData.areas]

  const handleTalentToggle = (talent: string) => {
    setResponses((prev) => {
      const currentTalents = prev.intereses[areaKey]?.talentos || []
      const newTalents = currentTalents.includes(talent) ? currentTalents.filter((t) => t !== talent) : [...currentTalents, talent]
      return { ...prev, intereses: { ...prev.intereses, [areaKey]: { talentos: newTalents, noTalentos: prev.intereses[areaKey]?.noTalentos || [] } } }
    })
  }

  const handleNoTalentToggle = (talent: string) => {
    setResponses((prev) => {
      const currentNoTalents = prev.intereses[areaKey]?.noTalentos || []
      const newNoTalents = currentNoTalents.includes(talent) ? currentNoTalents.filter((t) => t !== talent) : [...currentNoTalents, talent]
      return { ...prev, intereses: { ...prev.intereses, [areaKey]: { talentos: prev.intereses[areaKey]?.talentos || [], noTalentos: newNoTalents } } }
    })
  }

  const availableNoTalentos = area.talentos.filter((talent) => !(responses.intereses[areaKey]?.talentos || []).includes(talent))

  const handleNextPhase = () => {
    if (phase === "talentos") { setPhase("noTalentos") }
    else {
      if (currentArea < areaKeys.length - 1) { setCurrentArea((p) => p + 1); setPhase("talentos") }
      else { setCurrentSection((p) => p + 1) }
    }
  }

  const handlePrevPhase = () => {
    if (phase === "noTalentos") { setPhase("talentos") }
    else { if (currentArea > 0) { setCurrentArea((p) => p - 1); setPhase("noTalentos") } }
  }

  const isFirst = currentArea === 0 && phase === "talentos"
  const isLast = currentArea === areaKeys.length - 1 && phase === "noTalentos"
  const hasCurrentPhaseSelection = phase === "talentos" ? (responses.intereses[areaKey]?.talentos?.length || 0) > 0 : true

  return (
    <div className="space-y-4">
      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{area.title}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${phase === "talentos" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>
              {phase === "talentos" ? "Talentos" : "No Talentos"}
            </span>
          </div>

          {phase === "talentos" ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">Selecciona los talentos que reconoces en vos para esta area:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {area.talentos.map((talent) => (
                  <div key={talent} className={`flex items-center space-x-2 rounded-lg border p-3 transition-colors ${responses.intereses[areaKey]?.talentos?.includes(talent) ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "hover:bg-secondary/50"}`}>
                    <Checkbox id={`talent-${areaKey}-${talent}`} checked={responses.intereses[areaKey]?.talentos?.includes(talent) || false} onCheckedChange={() => handleTalentToggle(talent)} />
                    <label htmlFor={`talent-${areaKey}-${talent}`} className="flex-1 cursor-pointer text-sm leading-none">{talent}</label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">De los restantes, selecciona aquellos en los que NO te destacas o no te interesan:</p>
              {availableNoTalentos.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableNoTalentos.map((talent) => (
                    <div key={talent} className={`flex items-center space-x-2 rounded-lg border p-3 transition-colors ${responses.intereses[areaKey]?.noTalentos?.includes(talent) ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "hover:bg-secondary/50"}`}>
                      <Checkbox id={`notalent-${areaKey}-${talent}`} checked={responses.intereses[areaKey]?.noTalentos?.includes(talent) || false} onCheckedChange={() => handleNoTalentToggle(talent)} />
                      <label htmlFor={`notalent-${areaKey}-${talent}`} className="flex-1 cursor-pointer text-sm leading-none">{talent}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">Seleccionaste todos los talentos de esta area. No hay opciones para marcar como "No Talento".</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="border-none bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={isFirst} onClick={handlePrevPhase}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Area {currentArea + 1} de {areaKeys.length} - {phase === "talentos" ? "Paso 1/2" : "Paso 2/2"}</span>
          <Button variant="ghost" disabled={!hasCurrentPhaseSelection} onClick={handleNextPhase}>{isLast ? "Continuar" : "Siguiente"}</Button>
        </div>
      </Card>
    </div>
  )
}

function AutobiografiaSection({ responses, setResponses, setCurrentSection }: {
  responses: AutodescubrimientoResponse
  setResponses: React.Dispatch<React.SetStateAction<AutodescubrimientoResponse>>
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>
}) {
  const handleFieldChange = (fieldId: string, value: string) => {
    setResponses((prev) => ({ ...prev, autobiografia: { ...prev.autobiografia, [fieldId]: value } }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Autobiografia</h3>
          <p className="text-sm text-muted-foreground">Escribi tu historia de vida de forma simple y sincera. La idea no es escribir "perfecto", sino pensar en quien sos, de donde venis y hacia donde te gustaria ir.</p>
        </div>
      </Card>

      {autodescubrimientoData.autobiografiaFields.map((field) => (
        <Card key={field.id} className="border-none bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <div>
              <Label className="text-base font-semibold">{field.label}</Label>
              <p className="mt-1 text-sm text-muted-foreground">{field.description}</p>
            </div>
            <Textarea value={responses.autobiografia?.[field.id] || ""} onChange={(e) => handleFieldChange(field.id, e.target.value)} placeholder="Escribi tu respuesta aqui..." className="min-h-[100px]" />
          </div>
        </Card>
      ))}

      <Card className="border-none bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentSection(0)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Autobiografia</span>
          <Button variant="ghost" onClick={() => setCurrentSection(2)}>Siguiente</Button>
        </div>
      </Card>
    </div>
  )
}

function EstilosAprendizajeSection({ responses, setResponses, setCurrentSection, handleSave, isSaving, isFormComplete }: {
  responses: AutodescubrimientoResponse
  setResponses: React.Dispatch<React.SetStateAction<AutodescubrimientoResponse>>
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>
  handleSave: () => Promise<void>
  isSaving: boolean
  isFormComplete: () => boolean
}) {
  const handleResponse = (questionIndex: number, value: string) => {
    setResponses((prev) => ({ ...prev, estilosAprendizaje: { ...prev.estilosAprendizaje, [questionIndex]: value } }))
  }

  const handleOpenResponse = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, preguntasAbiertas: { ...prev.preguntasAbiertas, [questionId]: value } }))
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Estilos de Aprendizaje</h3>
          <p className="text-sm text-muted-foreground">Elegi una opcion por pregunta</p>
        </div>
      </Card>

      {autodescubrimientoData.estilosAprendizajePreguntas.map((item, index) => (
        <Card key={index} className="border-none bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <p className="font-medium">{item.question}</p>
            <RadioGroup value={responses.estilosAprendizaje[index]} onValueChange={(value) => handleResponse(index, value)}>
              {item.options.map((option, optIndex) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`q${index}-${option}`} />
                  <Label htmlFor={`q${index}-${option}`}>{optIndex + 1}. {option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>
      ))}

      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Preguntas de Reflexion</h3>
          <p className="text-sm text-muted-foreground">Responde con tus propias palabras</p>
        </div>
      </Card>

      {autodescubrimientoData.preguntasAbiertas.map((item) => (
        <Card key={item.id} className="border-none bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <div>
              <Label className="text-base font-semibold">{item.label}</Label>
              <p className="mt-1 text-sm text-muted-foreground">{item.question}</p>
            </div>
            <Textarea value={responses.preguntasAbiertas?.[item.id] || ""} onChange={(e) => handleOpenResponse(item.id, e.target.value)} placeholder="Escribi tu respuesta aqui..." className="min-h-[100px]" />
          </div>
        </Card>
      ))}

      <Card className="border-none bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentSection(1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Estilos de Aprendizaje</span>
          <Button onClick={handleSave} disabled={!isFormComplete() || isSaving} className="min-w-[100px]">{isSaving ? "Guardando..." : "Guardar"}</Button>
        </div>
      </Card>
    </div>
  )
}
