"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight, ChevronLeft } from "lucide-react"

type QuestionType = "abc" | "yesno" | "number" | "scale" | "text" | "multiselect" | "ranking"

type Question = {
  id: string; question: string; type: QuestionType; options?: { value: string; label: string }[]; placeholder?: string; min?: number; max?: number
}

const rankingCategories = [
  { value: "critico", label: "Critico", color: "bg-red-500" },
  { value: "importante", label: "Importante", color: "bg-orange-500" },
  { value: "levemente", label: "Levemente importante", color: "bg-yellow-500" },
  { value: "indiferente", label: "Indiferente", color: "bg-gray-400" },
]

type Block = { id: string; title: string; subtitle: string; questions: Question[] }

const blocks: Block[] = [
  {
    id: "economia", title: "Costo y Becas", subtitle: "Factor Economico",
    questions: [
      { id: "cuota", question: "En cuanto al contexto economico de tu familia, que tipo de cuota decidieron pagar para tus estudios?", type: "abc", options: [
        { value: "A", label: "Sin cuota, gratis. No podemos ir a una universidad privada." },
        { value: "B", label: "Cuota media. Podemos pagar algunas universidades privadas que no sean muy caras, o ir a las caras si nos dan beca." },
        { value: "C", label: "Cuota alta. Tenemos la posibilidad de poder pagar casi cualquier universidad." },
      ]},
      { id: "beca", question: "Esfuerzo extra: En caso de necesitar beca, estoy dispuesto a cumplir con los requisitos academicos (promedio alto, asistencia perfecta) que suelen pedir para mantenerla?", type: "yesno" },
    ],
  },
  {
    id: "logistica", title: "Ubicacion y Viaje", subtitle: "Factor Logistico",
    questions: [
      { id: "lugar_vivienda", question: "Donde vas a vivir en los anos que estudies? (Provincia, barrio)", type: "text", placeholder: "Ej: CABA, Palermo" },
      { id: "zona", question: "Zona: Donde aceptarias que este ubicada la universidad a la que quieras asistir?", type: "multiselect", options: [
        { value: "caba_norte", label: "CABA Norte" }, { value: "caba_sur", label: "CABA Sur" }, { value: "caba_centro", label: "CABA Centro" },
        { value: "zona_norte", label: "Zona Norte GBA" }, { value: "zona_sur", label: "Zona Sur GBA" }, { value: "zona_oeste", label: "Zona Oeste GBA" },
        { value: "interior", label: "Interior del pais" }, { value: "cualquiera", label: "Me da igual / Cualquier lugar" },
      ]},
    ],
  },
  {
    id: "ingreso", title: "Requisitos de Inscripcion", subtitle: "Factor de Ingreso",
    questions: [
      { id: "disposicion_ingreso", question: "Disposicion al ingreso: Estoy dispuesto a preparar un examen de ingreso exigente o hacer un curso de nivelacion largo antes de empezar la carrera oficialmente?", type: "yesno" },
    ],
  },
  {
    id: "identidad", title: "Otros Elementos", subtitle: "Factor Identidad y Extras",
    questions: [
      { id: "prestigio", question: "Perfil Institucional: Es importante para mi que la universidad tenga cierto prestigio o reconocimiento social, o priorizo otras cosas?", type: "abc", options: [
        { value: "A", label: "Si, el prestigio es muy importante para mi" }, { value: "B", label: "Me importa un poco, pero no es lo principal" }, { value: "C", label: "No me importa, priorizo otras cosas" },
      ]},
      { id: "valores", question: "Valores: Busco una universidad con una afiliacion religiosa o ideologia especifica, o prefiero un ambiente laico?", type: "abc", options: [
        { value: "A", label: "Prefiero una universidad con afiliacion religiosa" }, { value: "B", label: "Prefiero un ambiente laico/diverso" }, { value: "C", label: "Me es indiferente" },
      ]},
      { id: "entorno", question: "El entorno: Me importa como son las instalaciones (campus, laboratorios, tecnologia) o me da igual mientras el nivel academico sea bueno?", type: "abc", options: [
        { value: "A", label: "Las instalaciones son muy importantes para mi" }, { value: "B", label: "Me importa un poco, pero priorizo lo academico" }, { value: "C", label: "Me da igual, solo me importa el nivel academico" },
      ]},
    ],
  },
  {
    id: "podio", title: "Podio de Prioridades", subtitle: "Ordenar por importancia",
    questions: [
      { id: "ranking", question: "Recien discutimos 5 temas. Asignale a cada uno una categoria de importancia:", type: "ranking", options: [
        { value: "costo", label: "Costo" }, { value: "ubicacion", label: "Ubicacion" }, { value: "tiempo_ingreso", label: "Tiempo extra por examen de ingreso" },
        { value: "reconocimiento", label: "Reconocimiento institucional y calidad de las instalaciones" }, { value: "afiliacion", label: "Afiliacion religiosa" },
      ]},
    ],
  },
]

interface UniversidadFormProps { userId: number; onComplete: () => void; onSave: (sectionId: number, responses: any, meta: object) => Promise<void> }

export function UniversidadForm({ userId, onComplete, onSave }: UniversidadFormProps) {
  const [currentBlock, setCurrentBlock] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({})

  const block = blocks[currentBlock]
  const progress = ((currentBlock + 1) / blocks.length) * 100

  const handleAnswer = (questionId: string, value: string) => { setAnswers((prev) => ({ ...prev, [questionId]: value })) }
  const handleMultiSelect = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || []
      const newValue = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      return { ...prev, [questionId]: newValue }
    })
  }
  const handleRanking = (questionId: string, itemValue: string, category: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as Record<string, string>) || {}
      return { ...prev, [questionId]: { ...current, [itemValue]: category } }
    })
  }

  const isBlockComplete = () => {
    return block.questions.every((q) => {
      const answer = answers[q.id]
      if (q.type === "multiselect") return Array.isArray(answer) && answer.length > 0
      if (q.type === "ranking" && q.options) { const ranking = answer as Record<string, string>; return ranking && q.options.every((opt) => ranking[opt.value]) }
      return answer && answer !== ""
    })
  }

  const isFormCompleteOverall = () => {
    return blocks.every((b) => {
      return b.questions.every((q) => {
        const answer = answers[q.id]
        if (q.type === "multiselect") return Array.isArray(answer) && answer.length > 0
        if (q.type === "ranking" && q.options) { const ranking = answer as Record<string, string>; return ranking && q.options.every((opt) => ranking[opt.value]) }
        return answer && answer !== ""
      })
    })
  }

  const handleSubmit = async () => {
    if (!isFormCompleteOverall()) return
    setIsSaving(true)
    try {
      const formattedResponses: any[] = []
      let questionNumber = 1
      blocks.forEach(b => {
        b.questions.forEach(question => {
          const answer = answers[question.id]
          if (answer !== undefined && answer !== "") {
            let formattedAnswer: string
            if (question.type === "abc" || question.type === "yesno") {
              if (question.type === "yesno") { formattedAnswer = answer === "si" ? "Si" : "No" }
              else if (question.options) { const option = question.options.find(opt => opt.value === answer); formattedAnswer = option ? option.label : answer as string }
              else { formattedAnswer = answer as string }
            } else if (question.type === "multiselect" && Array.isArray(answer) && question.options) {
              const labels = answer.map(value => { const option = question.options!.find(opt => opt.value === value); return option ? option.label : value })
              formattedAnswer = JSON.stringify(labels)
            } else if (question.type === "ranking" && question.options) {
              const ranking = answer as Record<string, string>
              const formattedRanking: Record<string, string> = {}
              Object.entries(ranking).forEach(([itemValue, category]) => {
                const option = question.options!.find(opt => opt.value === itemValue)
                const itemLabel = option ? option.label : itemValue
                const categoryLabel = rankingCategories.find(cat => cat.value === category)?.label || category
                formattedRanking[itemLabel] = categoryLabel
              })
              formattedAnswer = JSON.stringify(formattedRanking)
            } else { formattedAnswer = Array.isArray(answer) ? JSON.stringify(answer) : answer as string }
            formattedResponses.push({ questionNumber, question: question.question, responseText: formattedAnswer })
            questionNumber++
          }
        })
      })
      await onSave(0, formattedResponses, { totalBlocks: blocks.length, section: "universidad" })
      onComplete()
    } catch (error) {
      console.error("Error saving responses:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Bloque {currentBlock + 1} de {blocks.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">{block.title}</h2>
        <p className="text-sm text-muted-foreground">{block.subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {block.questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-base font-medium">{question.question}</Label>

              {question.type === "abc" && question.options && (
                <RadioGroup value={(answers[question.id] as string) || ""} onValueChange={(value) => handleAnswer(question.id, value)} className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50">
                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                      <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer text-sm"><span className="font-semibold text-primary">{option.value}.</span> {option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "yesno" && (
                <RadioGroup value={(answers[question.id] as string) || ""} onValueChange={(value) => handleAnswer(question.id, value)} className="flex gap-4">
                  <div className="flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors hover:bg-secondary/50"><RadioGroupItem value="si" id={`${question.id}-si`} /><Label htmlFor={`${question.id}-si`} className="cursor-pointer">Si</Label></div>
                  <div className="flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors hover:bg-secondary/50"><RadioGroupItem value="no" id={`${question.id}-no`} /><Label htmlFor={`${question.id}-no`} className="cursor-pointer">No</Label></div>
                </RadioGroup>
              )}

              {question.type === "text" && (
                <Input type="text" placeholder={question.placeholder} value={(answers[question.id] as string) || ""} onChange={(e) => handleAnswer(question.id, e.target.value)} className="max-w-md" />
              )}

              {question.type === "multiselect" && question.options && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = ((answers[question.id] as string[]) || []).includes(option.value)
                    return (
                      <div key={option.value} className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors cursor-pointer ${selected ? "border-primary bg-primary/10" : "hover:bg-secondary/50"}`} onClick={() => handleMultiSelect(question.id, option.value)}>
                        <Checkbox checked={selected} onCheckedChange={() => handleMultiSelect(question.id, option.value)} />
                        <Label className="flex-1 cursor-pointer text-sm">{option.label}</Label>
                      </div>
                    )
                  })}
                </div>
              )}

              {question.type === "ranking" && question.options && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rankingCategories.map((cat) => (<span key={cat.value} className={`${cat.color} text-white text-xs px-2 py-1 rounded`}>{cat.label}</span>))}
                  </div>
                  {question.options.map((option) => {
                    const ranking = (answers[question.id] as Record<string, string>) || {}
                    return (
                      <div key={option.value} className="space-y-2">
                        <Label className="text-sm font-medium">{option.label}</Label>
                        <div className="flex flex-wrap gap-2">
                          {rankingCategories.map((cat) => (
                            <button key={cat.value} type="button" onClick={() => handleRanking(question.id, option.value, cat.value)}
                              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${ranking[option.value] === cat.value ? `${cat.color} text-white border-transparent` : "hover:bg-secondary/50"}`}>{cat.label}</button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentBlock((prev) => prev - 1)} disabled={currentBlock === 0}><ChevronLeft className="mr-2 h-4 w-4" />Anterior</Button>
        {currentBlock < blocks.length - 1 ? (
          <Button onClick={() => setCurrentBlock((prev) => prev + 1)} disabled={!isBlockComplete()}>Siguiente<ChevronRight className="ml-2 h-4 w-4" /></Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!isBlockComplete() || isSaving}>{isSaving ? "Guardando..." : "Guardar y Finalizar"}</Button>
        )}
      </div>
    </div>
  )
}
