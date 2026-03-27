"use client"

import { useState, useCallback } from "react"
import { WelcomeScreen } from "./welcome-screen"
import { PersonalDataForm, type PersonalData } from "./personal-data-form"
import { CareerStatus } from "./career-status"
import { CareerChangeQuestions, type CareerChangeData } from "./career-change-questions"
import { InitialQuestion } from "./initial-question"
import { CareerInput } from "./career-input"
import { PersonaValidator } from "./persona-validator"
import type { CareerCount, UserPersona } from "@/types/questionnaire"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface QuestionnaireFlowProps {
  userId: number
  onComplete: (persona: UserPersona) => void
  onSavePersonalData?: (data: PersonalData) => Promise<void>
}

type Step = "welcome" | "personalData" | "careerStatus" | "careerChangeQuestions" | "initial" | "careerInput" | "validation" | "restart"

const STEP_ORDER: Step[] = ["welcome", "personalData", "careerStatus", "initial"]
const TOTAL_ONBOARDING_STEPS = 3 // personalData, careerStatus, initial/careerInput

function getStepIndex(step: Step): number {
  const map: Record<Step, number> = {
    welcome: 0,
    personalData: 1,
    careerStatus: 2,
    careerChangeQuestions: 2,
    initial: 3,
    careerInput: 3,
    validation: 3,
    restart: 0,
  }
  return map[step] ?? 0
}

export function QuestionnaireFlow({ userId, onComplete, onSavePersonalData }: QuestionnaireFlowProps) {
  const [step, setStep] = useState<Step>("welcome")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [careerStatus, setCareerStatus] = useState<"first" | "change" | null>(null)

  const [careerChangeData, setCareerChangeData] = useState<CareerChangeData | null>(null)

  const [selectedCount, setSelectedCount] = useState<CareerCount | null>(null)
  const [userCareers, setUserCareers] = useState<string[]>([])
  const [availablePersonas, setAvailablePersonas] = useState<UserPersona[]>([])

  const transitionTo = useCallback((nextStep: Step) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setStep(nextStep)
      setIsTransitioning(false)
    }, 200)
  }, [])

  const handlePersonalDataComplete = async (data: PersonalData) => {
    setPersonalData(data)
    if (onSavePersonalData) {
      await onSavePersonalData(data)
    }
    transitionTo("careerStatus")
  }

  const handleCareerStatusSelect = (status: "first" | "change") => {
    setCareerStatus(status)
    if (status === "first") {
      transitionTo("initial")
    } else {
      transitionTo("careerChangeQuestions")
    }
  }

  const handleCareerChangeComplete = (data: CareerChangeData) => {
    setCareerChangeData(data)
    transitionTo("initial")
  }

  const allPersonas: UserPersona[] = [
    "buscador",
    "multipotencial",
    "analitico",
    "practico",
    "determinado",
    "enfocado",
    "estratega",
    "reinventado",
  ]

  const handleCountSelect = (count: CareerCount) => {
    setSelectedCount(count)
    if (count === "0") {
      setAvailablePersonas(allPersonas)
      transitionTo("validation")
    } else {
      transitionTo("careerInput")
    }
  }

  const handleCareerSubmit = (careers: string[]) => {
    setUserCareers(careers)
    setAvailablePersonas(allPersonas)
    transitionTo("validation")
  }

  const handlePersonaConfirm = (persona: UserPersona) => {
    onComplete(persona)
  }

  const handleNoneMatch = () => {
    transitionTo("restart")
  }

  const handleRestart = () => {
    setCareerStatus(null)
    setCareerChangeData(null)
    setSelectedCount(null)
    setUserCareers([])
    setAvailablePersonas([])
    transitionTo("careerStatus")
  }

  // Progress indicator for onboarding steps
  const currentStepIdx = getStepIndex(step)
  const showProgress = step !== "welcome" && step !== "restart" && step !== "validation"
  const totalSteps = TOTAL_ONBOARDING_STEPS

  const wrapperClass = `transition-all duration-200 ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`

  if (step === "welcome") {
    return (
      <div className={wrapperClass}>
        <WelcomeScreen onContinue={() => transitionTo("personalData")} />
      </div>
    )
  }

  // Progress bar component for onboarding steps
  const ProgressBar = showProgress ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-2xl px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i < currentStepIdx
                      ? "bg-primary"
                      : i === Math.floor(currentStepIdx)
                      ? "bg-primary/60"
                      : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {Math.floor(currentStepIdx)}/{totalSteps}
          </span>
        </div>
      </div>
    </div>
  ) : null

  if (step === "personalData") {
    return (
      <div className={wrapperClass}>
        {ProgressBar}
        <PersonalDataForm onSubmit={handlePersonalDataComplete} />
      </div>
    )
  }

  if (step === "careerStatus") {
    return (
      <div className={wrapperClass}>
        {ProgressBar}
        <CareerStatus onSelect={handleCareerStatusSelect} />
      </div>
    )
  }

  if (step === "careerChangeQuestions") {
    return (
      <div className={wrapperClass}>
        {ProgressBar}
        <CareerChangeQuestions onSubmit={handleCareerChangeComplete} />
      </div>
    )
  }

  if (step === "initial") {
    return (
      <div className={wrapperClass}>
        {ProgressBar}
        <InitialQuestion onSelect={handleCountSelect} />
      </div>
    )
  }

  if (step === "careerInput" && selectedCount) {
    return (
      <div className={wrapperClass}>
        {ProgressBar}
        <CareerInput count={selectedCount} onSubmit={handleCareerSubmit} />
      </div>
    )
  }

  if (step === "restart") {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-6 ${wrapperClass}`}>
        <Card className="w-full max-w-2xl p-8 sm:p-12 animate-scale-in">
          <div className="space-y-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl text-balance">
                Ninguna descripcion parecio encajar
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Parece que ninguna de estas descripciones encaja con tu situacion actual. Probablemente la cantidad de
                carreras que mencionaste no refleja del todo tu realidad.
              </p>
              <p className="text-base text-muted-foreground text-pretty">
                Empecemos de nuevo para ajustar mejor la punteria.
              </p>
            </div>
            <Button size="lg" onClick={handleRestart} className="gap-2 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
              <RotateCcw className="h-5 w-5" />
              Empezar de nuevo
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <PersonaValidator personas={availablePersonas} onSelect={handlePersonaConfirm} onRestart={handleNoneMatch} />
    </div>
  )
}
