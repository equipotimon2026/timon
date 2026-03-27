export type FamilyMemberType =
  | "padre"
  | "madre"
  | "abuelo_paterno"
  | "abuela_paterna"
  | "abuelo_materno"
  | "abuela_materna"
  | "hermano"
  | "tio"
  | "primo"

export type FamilySide = "paterno" | "materno"

export type FamilyMember = {
  id: string
  type: FamilyMemberType
  nombre: string
  estudios: string
  actividad: string
  ladoFamilia?: FamilySide
}

export const familyMemberLabels: Record<FamilyMemberType, string> = {
  padre: "Padre",
  madre: "Madre",
  abuelo_paterno: "Abuelo Paterno",
  abuela_paterna: "Abuela Paterna",
  abuelo_materno: "Abuelo Materno",
  abuela_materna: "Abuela Materna",
  hermano: "Hermano/a",
  tio: "Tío/a",
  primo: "Primo/a",
}

export const fixedMembers: FamilyMemberType[] = [
  "padre",
  "madre",
  "abuelo_paterno",
  "abuela_paterna",
  "abuelo_materno",
  "abuela_materna",
]

export const dynamicMembers: FamilyMemberType[] = [
  "hermano",
  "tio",
  "primo",
]
