"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, GraduationCap, Loader2 } from "lucide-react"

export interface PersonalData {
  phone: string
  age: number
  school: string
  year: string
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => Promise<void>
}

export function PersonalDataForm({ onSubmit }: PersonalDataFormProps) {
  const [data, setData] = useState<PersonalData>({
    age: 0,
    phone: "",
    school: "",
    year: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof PersonalData, value: string) => {
    setData((prev) => ({ ...prev, [field]: field === "age" ? parseInt(value) || 0 : value }))
  }

  const isValid = data.phone && data.age >= 14 && data.school && data.year

  const handleSubmit = async () => {
    if (isValid && !loading) {
      setLoading(true)
      try {
        await onSubmit(data)
      } catch (error) {
        console.error('Error saving user data:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-4 pt-16">
      <Card className="w-full max-w-md p-6 sm:p-8 animate-fade-up">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Datos educativos</h2>
            <p className="text-sm text-muted-foreground">Contanos sobre tu situacion escolar</p>
          </div>

          {/* Form */}
          <div className="space-y-4 animate-fade-up animation-delay-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={data.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-sm font-medium">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="17"
                  min={14}
                  max={99}
                  value={data.age || ""}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="school" className="text-sm font-medium">Colegio</Label>
              <Input
                id="school"
                placeholder="Nombre del colegio"
                value={data.school}
                onChange={(e) => handleChange("school", e.target.value)}
                className="rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-sm font-medium">Año</Label>
              <Select value={data.year} onValueChange={(value) => handleChange("year", value)}>
                <SelectTrigger id="year" className="rounded-xl">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4to">4to año</SelectItem>
                  <SelectItem value="5to">5to año</SelectItem>
                  <SelectItem value="6to">6to año</SelectItem>
                  <SelectItem value="egresado">Egresado</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <div className="animate-fade-up animation-delay-200">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="group w-full gap-2 rounded-xl h-12 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Tus datos se usan unicamente para el proceso de orientacion
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
