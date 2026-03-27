"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Plus, X } from "lucide-react"
import type { CareerCount } from "@/types/questionnaire"

interface CareerInputProps {
  count: CareerCount
  onSubmit: (careers: string[]) => void
}

export function CareerInput({ count, onSubmit }: CareerInputProps) {
  const [careers, setCareers] = useState<string[]>([""])

  const maxCareers = count === "1" ? 1 : count === "2-3" ? 3 : 5

  const addCareer = () => {
    if (careers.length < maxCareers) {
      setCareers([...careers, ""])
    }
  }

  const removeCareer = (index: number) => {
    setCareers(careers.filter((_, i) => i !== index))
  }

  const updateCareer = (index: number, value: string) => {
    const updated = [...careers]
    updated[index] = value
    setCareers(updated)
  }

  const handleSubmit = () => {
    const validCareers = careers.filter((c) => c.trim() !== "")
    if (validCareers.length > 0) {
      onSubmit(validCareers)
    }
  }

  const canSubmit = careers.some((c) => c.trim() !== "")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-4">
      <Card className="w-full max-w-xl p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Cuales carreras tienes en mente?</h2>
            <p className="text-sm text-muted-foreground">Escribe las opciones que estas considerando</p>
          </div>

          <div className="space-y-3">
            {careers.map((career, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={career}
                  onChange={(e) => updateCareer(index, e.target.value)}
                  placeholder={`Carrera ${index + 1}`}
                  className="flex-1"
                />
                {careers.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeCareer(index)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {careers.length < maxCareers && (
              <Button variant="outline" onClick={addCareer} className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Agregar otra
              </Button>
            )}

            <Button onClick={handleSubmit} disabled={!canSubmit} className="ml-auto gap-2">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
