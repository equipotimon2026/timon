"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { herrmannQuestions } from "@/lib/questionnaires/herrmann-questions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type QuestionType =
  | "motivacion"
  | "aprendizaje"
  | "aprendizajeModo"
  | "tipoPregunta"
  | "meGusta"
  | "comprarChoice"
  | "comprarCoche"
  | "comprarCelular"
  | "comportamiento"
  | "estiloPalabras"
  | "desprecio"
  | "resolucionProblema"
  | "visionProblema"
  | "frasesAproximadas"

type HerrmannResponse = {
  motivacion: string[]
  aprendizaje: string[]
  aprendizajeModo: string[]
  tipoPregunta: string
  meGusta: string[]
  comprarChoice: string
  comprarCoche: string[]
  comprarCelular: string[]
  comportamiento: string
  estiloPalabras: string[]
  desprecio: string[]
  resolucionProblema: string
  visionProblema: string
  frasesAproximadas: string[]
}

const questionSteps: { key: QuestionType; title: string; limit?: number }[] = [
  { key: "motivacion", title: "Marque los 5 sentidos o situaciones que lo hacen sentirse mas motivado en el trabajo", limit: 5 },
  { key: "aprendizaje", title: "Cuando aprendo, me gusta... (marque 5 alternativas)", limit: 5 },
  { key: "aprendizajeModo", title: "Prefiero aprender a traves de... (marque 5 alternativas)", limit: 5 },
  { key: "tipoPregunta", title: "Cual es el tipo de pregunta que mas le gusta hacer?", limit: 1 },
  { key: "meGusta", title: "Senale lo que mas le gusta hacer (marque 4)", limit: 4 },
  { key: "comprarChoice", title: "Con que situacion preferis responder?", limit: 1 },
  { key: "comprarCoche", title: "Al comprar un coche usted... (marque 5 frases)", limit: 5 },
  { key: "comprarCelular", title: "Al comprar un celular vos... (marque 5 frases)", limit: 5 },
  { key: "comportamiento", title: "Como define su comportamiento?", limit: 1 },
  { key: "estiloPalabras", title: "Palabras que definen mi estilo (marque 4)", limit: 4 },
  { key: "desprecio", title: "Frases de tono despreciativo que mas ha escuchado (marque 5)", limit: 5 },
  { key: "resolucionProblema", title: "Cuando tengo que resolver un problema, generalmente yo...", limit: 1 },
  { key: "visionProblema", title: "Cuando tengo que resolver un problema, busco...", limit: 1 },
  { key: "frasesAproximadas", title: "Cuales son las frases que mas se aproximan a lo que usted dice? (marque 3)", limit: 3 },
]

const comprarChoiceOptions = ["Comprar un coche", "Comprar un celular"]

const resolucionOptions = [
  'Miro el panorama completo y confio en lo que me dice mi instinto para encontrar la solucion',
  'Organizo los "hechos" tratando los detalles de forma realista y cronologica.',
  'Siento los "hechos" y pienso en como nos afecta a todos y trato de resolverlo compartiendo lo que sentimos',
  'Analizo los "hechos" tratandolos de forma logica y racional.',
]

const visionOptions = [
  'Una vision interpersonal, emocional "humana".',
  'Una vision organizada, detallada, "cronologica".',
  'Una vision analitica, logica, racional, "de resultados".',
  'Una vision intuitiva, conceptual, visual, de "contexto general".',
]

const frasesAproximadasOptions = [
  "Siempre hacemos las cosas de esta forma",
  "Vayamos al punto clave del problema",
  "Veamos los valores humanos",
  "Vamos a analizar",
  "Vamos a ver el cuadro general",
  "Vamos a ver el desarrollo del equipo",
  "Vamos a conocer el resultado",
  "Este es el gran suceso conceptual",
  "Vamos a mantener la ley y el orden",
  "Vamos a innovar y crear sinergia",
  "Vamos a participar y motivar",
  "Es mas seguro de esta forma",
]

interface HerrmannFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
}

export function HerrmannForm({ userId, onComplete, onSave }: HerrmannFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [responses, setResponses] = useState<HerrmannResponse>({
    motivacion: [],
    aprendizaje: [],
    aprendizajeModo: [],
    tipoPregunta: "",
    meGusta: [],
    comprarChoice: "",
    comprarCoche: [],
    comprarCelular: [],
    comportamiento: "",
    estiloPalabras: [],
    desprecio: [],
    resolucionProblema: "",
    visionProblema: "",
    frasesAproximadas: [],
  })

  const getActiveSteps = () => {
    const choice = responses.comprarChoice
    return questionSteps.filter((step) => {
      if (step.key === "comprarCoche") return choice === "Comprar un coche"
      if (step.key === "comprarCelular") return choice === "Comprar un celular"
      return true
    })
  }

  const activeSteps = getActiveSteps()
  const currentQuestion = activeSteps[currentStep]
  const totalQuestions = 13
  const progress = ((currentStep + 1) / totalQuestions) * 100

  const toggleItem = (item: string) => {
    const key = currentQuestion.key
    const limit = currentQuestion.limit || 1

    if (limit === 1) {
      setResponses((prev) => ({ ...prev, [key]: item }))
    } else {
      setResponses((prev) => {
        const current = prev[key] as string[]
        const newArray = current.includes(item) ? current.filter((i) => i !== item) : [...current, item]
        if (newArray.length > limit) return prev
        return { ...prev, [key]: newArray }
      })
    }
  }

  const canProceed = () => {
    const key = currentQuestion.key
    const limit = currentQuestion.limit || 1
    const response = responses[key]
    if (limit === 1) return response !== ""
    return Array.isArray(response) && response.length === limit
  }

  const getOptions = () => {
    const key = currentQuestion.key
    if (key === "comprarChoice") return comprarChoiceOptions
    if (key === "resolucionProblema") return resolucionOptions
    if (key === "visionProblema") return visionOptions
    if (key === "frasesAproximadas") return frasesAproximadasOptions
    return herrmannQuestions[key as keyof typeof herrmannQuestions] as string[]
  }

  const currentResponse = responses[currentQuestion.key]
  const selectedCount = Array.isArray(currentResponse) ? currentResponse.length : currentResponse ? 1 : 0
  const limit = currentQuestion.limit || 1

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const filteredSteps = activeSteps.filter(step => step.key !== "comprarChoice")
      const filteredResponses: Partial<HerrmannResponse> = {}
      filteredSteps.forEach(step => {
        (filteredResponses as any)[step.key] = responses[step.key]
      })

      await onSave(0, filteredResponses, {
        totalSteps: activeSteps.length,
        section: "herrmann"
      })

      onComplete()
    } catch (error) {
      console.error("Error saving Herrmann responses:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormComplete = () => {
    return activeSteps.every(step => {
      const response = responses[step.key]
      if (step.limit === 1) return response !== ""
      return Array.isArray(response) && response.length === (step.limit || 1)
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">III. Dominancia Cerebral (NED HERRMANN)</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Modelo de cuadrantes cerebrales de Herrmann (Creatividad y estilos de pensamiento).
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium">Consigna:</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Responda con total sinceridad, eligiendo la opcion con la que mas se identifica (no la "socialmente correcta").
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-primary">
                Pregunta {currentStep + 1} de {totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Current Question */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold">{currentQuestion.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Seleccionadas: {selectedCount} de {limit}
            </p>
          </div>

          {limit === 1 &&
          ["tipoPregunta", "comprarChoice", "comportamiento", "resolucionProblema", "visionProblema"].includes(currentQuestion.key) ? (
            <RadioGroup value={typeof currentResponse === 'string' ? currentResponse : ''} onValueChange={toggleItem}>
              <div className="space-y-3">
                {getOptions().map((option) => (
                  <div key={option} className="flex items-start gap-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer text-sm leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {getOptions().map((option) => (
                <label
                  key={option}
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                    Array.isArray(currentResponse) && currentResponse.includes(option)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={Array.isArray(currentResponse) && currentResponse.includes(option)}
                    onCheckedChange={() => toggleItem(option)}
                    className="mt-0.5"
                    disabled={
                      Array.isArray(currentResponse) &&
                      !currentResponse.includes(option) &&
                      currentResponse.length >= limit
                    }
                  />
                  <span className="text-sm leading-relaxed">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {totalQuestions}
          </span>
          {currentStep === activeSteps.length - 1 ? (
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
              disabled={!canProceed()}
              onClick={() => setCurrentStep((p) => p + 1)}
            >
              Siguiente
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
