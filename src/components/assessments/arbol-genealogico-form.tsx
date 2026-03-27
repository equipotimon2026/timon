"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react"
import {
  type FamilyMember,
  type FamilyMemberType,
  familyMemberLabels,
} from "@/lib/questionnaires/arbol-genealogico-questions"

type FamilyTreeData = {
  fixedMembers: Record<string, FamilyMember>
  dynamicMembers: FamilyMember[]
}

function generateId() { return Math.random().toString(36).substring(2, 9) }

function FamilyMemberCard({ member, onUpdate, onRemove, showSide = false }: {
  member: FamilyMember; onUpdate: (field: keyof FamilyMember, value: string) => void; onRemove?: () => void; showSide?: boolean
}) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">{familyMemberLabels[member.type]}</h4>
        {onRemove && (<Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>)}
      </div>
      <div className="grid gap-3">
        <div><Label htmlFor={`${member.id}-nombre`} className="text-sm">Nombre</Label><Input id={`${member.id}-nombre`} value={member.nombre} onChange={(e) => onUpdate("nombre", e.target.value)} placeholder="Nombre completo" className="mt-1" /></div>
        <div><Label htmlFor={`${member.id}-estudios`} className="text-sm">Estudios realizados</Label><Input id={`${member.id}-estudios`} value={member.estudios} onChange={(e) => onUpdate("estudios", e.target.value)} placeholder="Ej: Secundario completo, Universitario, etc." className="mt-1" /></div>
        <div><Label htmlFor={`${member.id}-actividad`} className="text-sm">Actividad que desempena/ba</Label><Input id={`${member.id}-actividad`} value={member.actividad} onChange={(e) => onUpdate("actividad", e.target.value)} placeholder="Ej: Contador, Docente, Comerciante, etc." className="mt-1" /></div>
        {showSide && (
          <div>
            <Label className="text-sm">Lado de la familia</Label>
            <RadioGroup value={member.ladoFamilia || ""} onValueChange={(value) => onUpdate("ladoFamilia", value)} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2"><RadioGroupItem value="paterno" id={`${member.id}-paterno`} /><Label htmlFor={`${member.id}-paterno`} className="font-normal">Papa</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="materno" id={`${member.id}-materno`} /><Label htmlFor={`${member.id}-materno`} className="font-normal">Mama</Label></div>
            </RadioGroup>
          </div>
        )}
      </div>
    </Card>
  )
}

interface ArbolGenealogFormProps { userId: number; onComplete: () => void; onSave: (sectionId: number, responses: any, meta: object) => Promise<void>; initialResponses?: any; onResponseChange?: (responses: any) => void }

export function ArbolGenealogForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: ArbolGenealogFormProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState<FamilyTreeData>(initialResponses ?? {
    fixedMembers: {
      padre: { id: "padre", type: "padre", nombre: "", estudios: "", actividad: "" },
      madre: { id: "madre", type: "madre", nombre: "", estudios: "", actividad: "" },
      abuelo_paterno: { id: "abuelo_paterno", type: "abuelo_paterno", nombre: "", estudios: "", actividad: "" },
      abuela_paterna: { id: "abuela_paterna", type: "abuela_paterna", nombre: "", estudios: "", actividad: "" },
      abuelo_materno: { id: "abuelo_materno", type: "abuelo_materno", nombre: "", estudios: "", actividad: "" },
      abuela_materna: { id: "abuela_materna", type: "abuela_materna", nombre: "", estudios: "", actividad: "" },
    },
    dynamicMembers: [],
  })

  useEffect(() => {
    onResponseChange?.(data);
  }, [data]);

  const sections = [
    { id: "padres", title: "Padres", members: ["padre", "madre"] },
    { id: "abuelos_paternos", title: "Abuelos Paternos", members: ["abuelo_paterno", "abuela_paterna"] },
    { id: "abuelos_maternos", title: "Abuelos Maternos", members: ["abuelo_materno", "abuela_materna"] },
    { id: "hermanos", title: "Hermanos/as", dynamicType: "hermano" as FamilyMemberType },
    { id: "tios", title: "Tios/as", dynamicType: "tio" as FamilyMemberType },
    { id: "primos", title: "Primos/as", dynamicType: "primo" as FamilyMemberType },
  ]

  const currentSectionData = sections[currentSection]
  const progress = ((currentSection + 1) / sections.length) * 100

  const updateFixedMember = (memberId: string, field: keyof FamilyMember, value: string) => {
    setData((prev) => ({ ...prev, fixedMembers: { ...prev.fixedMembers, [memberId]: { ...prev.fixedMembers[memberId], [field]: value } } }))
  }

  const updateDynamicMember = (id: string, field: keyof FamilyMember, value: string) => {
    setData((prev) => ({ ...prev, dynamicMembers: prev.dynamicMembers.map((m) => m.id === id ? { ...m, [field]: value } : m) }))
  }

  const addDynamicMember = (type: FamilyMemberType) => {
    const newMember: FamilyMember = { id: generateId(), type, nombre: "", estudios: "", actividad: "", ladoFamilia: undefined }
    setData((prev) => ({ ...prev, dynamicMembers: [...prev.dynamicMembers, newMember] }))
  }

  const removeDynamicMember = (id: string) => {
    setData((prev) => ({ ...prev, dynamicMembers: prev.dynamicMembers.filter((m) => m.id !== id) }))
  }

  const getDynamicMembersOfType = (type: FamilyMemberType) => data.dynamicMembers.filter((m) => m.type === type)

  const isFormComplete = () => {
    const hasPadreInfo = data.fixedMembers.padre.nombre.trim() !== "" || data.fixedMembers.padre.actividad.trim() !== ""
    const hasMadreInfo = data.fixedMembers.madre.nombre.trim() !== "" || data.fixedMembers.madre.actividad.trim() !== ""
    return hasPadreInfo && hasMadreInfo
  }

  const handleSubmit = async () => {
    if (!isFormComplete()) return
    setIsSaving(true)
    try {
      await onSave(0, data, { section: "arbol-genealogico" })
      onComplete()
    } catch (error) {
      console.error("Error saving family tree data:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Seccion {currentSection + 1} de {sections.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-none bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white"><Users className="h-6 w-6" /></div>
          <div><h2 className="text-xl font-bold text-foreground">Arbol Genealogico</h2><p className="text-sm text-muted-foreground">Completa los datos de tu familia para entender mejor tu contexto vocacional</p></div>
        </div>
      </Card>

      <div className="text-center"><h3 className="text-lg font-semibold text-foreground">{currentSectionData.title}</h3></div>

      {currentSectionData.members && (
        <div className="grid gap-4 md:grid-cols-2">
          {currentSectionData.members.map((memberId) => (
            <FamilyMemberCard key={memberId} member={data.fixedMembers[memberId]} onUpdate={(field, value) => updateFixedMember(memberId, field, value)} />
          ))}
        </div>
      )}

      {currentSectionData.dynamicType && (
        <div className="space-y-4">
          {getDynamicMembersOfType(currentSectionData.dynamicType).length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-muted-foreground mb-4">No agregaste ningun {familyMemberLabels[currentSectionData.dynamicType].toLowerCase()} todavia</p>
              <Button variant="outline" onClick={() => addDynamicMember(currentSectionData.dynamicType!)}><Plus className="mr-2 h-4 w-4" />Agregar {familyMemberLabels[currentSectionData.dynamicType]}</Button>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {getDynamicMembersOfType(currentSectionData.dynamicType).map((member) => (
                  <FamilyMemberCard key={member.id} member={member} onUpdate={(field, value) => updateDynamicMember(member.id, field, value)} onRemove={() => removeDynamicMember(member.id)} showSide={currentSectionData.dynamicType !== "hermano"} />
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => addDynamicMember(currentSectionData.dynamicType!)}><Plus className="mr-2 h-4 w-4" />Agregar otro {familyMemberLabels[currentSectionData.dynamicType].toLowerCase()}</Button>
              </div>
            </>
          )}
        </div>
      )}

      <Card className="border-none bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={currentSection === 0} onClick={() => setCurrentSection((p) => p - 1)}><ChevronLeft className="mr-2 h-4 w-4" />Anterior</Button>
          {currentSection < sections.length - 1 ? (
            <Button onClick={() => setCurrentSection((p) => p + 1)}>Siguiente<ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!isFormComplete() || isSaving}>{isSaving ? "Guardando..." : "Guardar y Finalizar"}</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
