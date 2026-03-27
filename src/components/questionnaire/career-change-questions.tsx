"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export interface CareerChangeData {
  previousCareer: string
  duration: string
  enrollmentReason: string
  quitReason: string
  hatedActivities: string[]
  likedSomething: string
  likedDetail?: string
  nonNegotiable: string
}

interface CareerChangeQuestionsProps {
  onSubmit: (data: CareerChangeData) => void
}

export function CareerChangeQuestions({ onSubmit }: CareerChangeQuestionsProps) {
  const [step, setStep] = useState(1)
  const [previousCareer, setPreviousCareer] = useState("")
  const [duration, setDuration] = useState("")
  const [enrollmentReason, setEnrollmentReason] = useState("")
  const [quitReason, setQuitReason] = useState("")
  const [hatedActivities, setHatedActivities] = useState<string[]>([])
  const [likedSomething, setLikedSomething] = useState("")
  const [likedDetail, setLikedDetail] = useState("")
  const [nonNegotiable, setNonNegotiable] = useState("")

  const activityOptions = [
    "Leer mucho",
    "Matematicas/Calculo",
    "Memorizar",
    "Hablar en publico",
    "Trabajar solo",
    "Dibujar/Proyectar",
  ]

  const toggleActivity = (activity: string) => {
    setHatedActivities((prev) => (prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]))
  }

  const handleNext = () => {
    if (step === 7) {
      onSubmit({
        previousCareer,
        duration,
        enrollmentReason,
        quitReason,
        hatedActivities,
        likedSomething,
        likedDetail,
        nonNegotiable,
      })
    } else {
      setStep(step + 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return previousCareer.trim() !== ""
      case 2:
        return duration !== ""
      case 3:
        return enrollmentReason !== ""
      case 4:
        return quitReason !== ""
      case 5:
        return hatedActivities.length > 0
      case 6:
        return likedSomething !== ""
      case 7:
        return nonNegotiable !== ""
      default:
        return false
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-6 py-8">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pregunta {step} de 7</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className={`h-1 w-6 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Que carrera empezaste?</h2>
              <div className="space-y-2">
                <Input
                  placeholder="Ej: Ingenieria, Medicina, Derecho..."
                  value={previousCareer}
                  onChange={(e) => setPreviousCareer(e.target.value)}
                  className="text-base"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Cuanto tiempo aguantaste?</h2>
              <div className="grid gap-2">
                {["Menos de 6 meses", "1 ano", "2 a 3 anos", "La termine (pero no quiero ejercer)"].map((option) => (
                  <Button
                    key={option}
                    variant={duration === option ? "default" : "outline"}
                    onClick={() => setDuration(option)}
                    className="justify-start text-left h-auto py-3"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Se sincero, por que te anotaste?</h2>
              <div className="grid gap-2">
                {[
                  "Me gustaba la idea que tenia de la carrera",
                  "Por el dinero / Salida laboral",
                  "Presion familiar / Todos mis amigos iban",
                  "No sabia que hacer y elegi cualquiera",
                ].map((option) => (
                  <Button
                    key={option}
                    variant={enrollmentReason === option ? "default" : "outline"}
                    onClick={() => setEnrollmentReason(option)}
                    className="justify-start text-left h-auto py-3 whitespace-normal"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Razon PRINCIPAL para dejarla?</h2>
              <div className="grid gap-2">
                {[
                  "El Contenido: Las materias me aburrian",
                  "La Dificultad: Era demasiado dificil / No entendia",
                  "El Futuro: No me imaginaba trabajando de eso",
                  "El Ambiente: No encajaba con la gente o el lugar",
                ].map((option) => (
                  <Button
                    key={option}
                    variant={quitReason === option ? "default" : "outline"}
                    onClick={() => setQuitReason(option)}
                    className="justify-start text-left h-auto py-3 whitespace-normal"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Que actividad especifica odiabas?</h2>
              <p className="text-sm text-muted-foreground">Selecciona todas las que apliquen</p>
              <div className="flex flex-wrap gap-2">
                {activityOptions.map((activity) => (
                  <Badge
                    key={activity}
                    variant={hatedActivities.includes(activity) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-2 text-sm"
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                    {hatedActivities.includes(activity) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Hubo algo que SI te gustara?</h2>
              <div className="grid gap-2">
                {[
                  "Nada, todo fue terrible",
                  "La vida social / amigos",
                  "Alguna materia especifica",
                  "La parte practica (hacer cosas)",
                ].map((option) => (
                  <Button
                    key={option}
                    variant={likedSomething === option ? "default" : "outline"}
                    onClick={() => setLikedSomething(option)}
                    className="justify-start text-left h-auto py-3"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {likedSomething === "Alguna materia especifica" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="liked-detail" className="text-sm">
                    Cual?
                  </Label>
                  <Input
                    id="liked-detail"
                    placeholder="Nombre de la materia..."
                    value={likedDetail}
                    onChange={(e) => setLikedDetail(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Para tu proxima carrera, que es innegociable?</h2>
              <div className="grid gap-2">
                {[
                  "Que gane buena plata",
                  "Que tenga tiempo libre",
                  "Que me apasione el tema",
                  "Que sea corta / rapida",
                ].map((option) => (
                  <Button
                    key={option}
                    variant={nonNegotiable === option ? "default" : "outline"}
                    onClick={() => setNonNegotiable(option)}
                    className="justify-start text-left h-auto py-3"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Atras
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
              {step === 7 ? "Finalizar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
