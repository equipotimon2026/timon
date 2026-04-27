"use client"

import { useState, useCallback } from "react"
import { JourneySidebar, Act, Chapter } from "./journey-sidebar"
import { MobileNav } from "./mobile-nav"
import { ActPersona } from "@/components/acts/act-persona"
import { ActCarreras } from "@/components/acts/act-carreras"
import { ActUniversidades } from "@/components/acts/act-universidades"
import { ActFuturo } from "@/components/acts/act-futuro"
import { Profile, profileData } from "@/lib/profile-data"
import { careersData, Career } from "@/lib/career-data"
import { universitiesData, University } from "@/lib/university-data"
import { MapaInternoData, demoMapaInterno } from "@/components/chapters/chapter-mapa-interno"
import { ResumenFinalData, demoResumenFinal } from "@/components/chapters/chapter-resumen-final"

// Agent career type (from agent output)
interface AgentCareer {
  id: string
  name: string
  field: string
  matchPercentage: number
  lifeGlimpse: string
  detail: {
    lifestyle: { narrative: string; dailyRoutine: string; environment: string }
    problems: { purpose: string; competencies: Array<{ title: string; description: string }>; hiddenTruth: string }
    compatibility: {
      mentalArchitecture: { status: string; description: string }
      entryBarrier: { status: string; description: string }
      socialBattery: { status: string; description: string }
      lifestyle: { status: string; description: string }
      workType: { status: string; description: string }
    }
    future: {
      jobOutcomes: Array<{ position: string; salarySenior: string }>
      automationRisk: number
      geographicFlexibility: string
      specializations: Array<{ name: string; niche: string; demand: string }>
    }
    academics: {
      weeklyHours: number
      complexity: string
      studyPlan: { description: string; distribution: Array<{ area: string; percentage: number; color: string }> }
      filterSubjects: Array<{ name: string; skill: string }>
      workStudyBalance: string
    }
  }
}

function mapAgentStatus(status: string): "ÓPTIMO" | "ALERTA" | "PELIGRO" {
  const map: Record<string, "ÓPTIMO" | "ALERTA" | "PELIGRO"> = {
    OPTIMAL: "ÓPTIMO", ALERT: "ALERTA", DANGER: "PELIGRO",
  }
  return map[status] || "ALERTA"
}

function transformAgentCareers(agentCareers: AgentCareer[]): Career[] {
  // Demo data for visual preview - will be ignored when agent returns these fields
  const demoAlternativeNames: Record<number, { commonName: string; alternativeNames: string[] }> = {
    0: {
      commonName: "Física",
      alternativeNames: ["Licenciatura en Física", "Física y Astronomía", "Ciencias Físicas"]
    },
    1: {
      commonName: "Astronomía",
      alternativeNames: ["Licenciatura en Astronomía", "Astrofísica", "Física y Astronomía"]
    },
    2: {
      commonName: "Ciencias Ambientales",
      alternativeNames: ["Ingeniería Ambiental", "Gestión Ambiental", "Ciencias de la Tierra"]
    },
  }

  return agentCareers.map((c, idx) => ({
    id: idx + 1,
    name: c.name,
    field: c.field,
    matchPercentage: c.matchPercentage,
    commonName: demoAlternativeNames[idx]?.commonName,
    alternativeNames: demoAlternativeNames[idx]?.alternativeNames,
    definition: { description: c.lifeGlimpse, purpose: c.detail.problems.purpose },
    competencies: c.detail.problems.competencies,
    academic: {
      complexity: c.detail.academics.complexity,
      weeklyHours: c.detail.academics.weeklyHours,
      presentialPercentage: 50,
      autonomousPercentage: 50,
      logicIntensity: "",
      theoreticalPercentage: 40,
      practicalPercentage: 60,
      dropoutRate: 0,
      filterSubjects: c.detail.academics.filterSubjects,
      workStudyBalance: c.detail.academics.workStudyBalance,
      studyPlan: c.detail.academics.studyPlan,
    },
    compatibility: {
      mentalArchitecture: { status: mapAgentStatus(c.detail.compatibility.mentalArchitecture.status), description: c.detail.compatibility.mentalArchitecture.description },
      entryBarrier: { status: mapAgentStatus(c.detail.compatibility.entryBarrier.status), description: c.detail.compatibility.entryBarrier.description },
      socialBattery: { status: mapAgentStatus(c.detail.compatibility.socialBattery.status), description: c.detail.compatibility.socialBattery.description },
      lifestyle: { status: mapAgentStatus(c.detail.compatibility.lifestyle.status), description: c.detail.compatibility.lifestyle.description },
      work: { status: mapAgentStatus(c.detail.compatibility.workType.status), description: c.detail.compatibility.workType.description },
    },
    operative: {
      dailyLoad: c.detail.lifestyle.narrative,
      strategicIntervention: c.detail.problems.hiddenTruth,
      environment: c.detail.lifestyle.environment,
      uncertaintyLevel: "",
    },
    market: {
      jobOutlets: c.detail.future.jobOutcomes.map(j => ({
        position: j.position, salaryJunior: "", salarySemiSenior: "", salarySenior: j.salarySenior,
      })),
      automationRisk: c.detail.future.automationRisk,
      employabilitySafety: "",
      salaryScalability: "",
      saturationIndex: "",
      geographicFlexibility: c.detail.future.geographicFlexibility,
      specializations: c.detail.future.specializations.map(s => ({
        name: s.name, niche: s.niche, demand: s.demand as "Alta" | "Media" | "Baja",
      })),
    },
  }))
}

// Agent profile type
interface AgentProfile {
  cognitive_traits?: { traits?: Array<{ name: string; description: string; level: number; levelLabel: string; isTension?: boolean }> }
  psychometrics?: {
    riasec?: { primary: { code: string; label: string; description: string }; secondary: Array<{ code: string; label: string; score: number }>; insight: string }
    intelligences?: { top: Array<{ name: string; score: number; icon: string; description: string }>; rest: Array<{ name: string; score: number; icon: string; description: string }> }
    brain_dominance?: { quadrants: Array<{ id: string; label: string; sublabel: string; score: number; description: string }>; insight: string }
    personality?: { pattern: string; traits: Array<{ name: string; pole: string; score: number; description: string }> }
  }
  energy?: { activates: string[]; drains: string[] }
  interests?: { areas: Array<{ name: string; score: number; levelLabel: string; insight: string }> }
  misaligned_areas?: { areas: Array<{ name: string; description: string; inferenceStrength: string }>; reframe: string }
  lifestyle?: { axes: Array<{ leftLabel: string; rightLabel: string; value: number; interpretation: string }> }
  essence?: {
    constellation: Array<{ label: string; icon: string; tier: number; color: string }>
    corePhrase: string
    shareableTag: string
    grid: { riasecCode: string; topIntelligence: string; dominanceStyle: string; millonPattern: string }
    elaboration: string
  }
}

interface AgentResults {
  profile?: AgentProfile
  careers?: { intro?: string; ranking?: AgentCareer[] }
  universities?: unknown
  meta?: unknown
}

interface VocationalJourneyProps {
  results?: AgentResults
}

// Define all chapters
const allChapters: Chapter[] = [
  // Act 1: Persona
  { id: "persona-intro", title: "Bienvenida", act: "persona" },
  { id: "persona-como", title: "Cómo llegamos acá", act: "persona" },
  { id: "persona-mente", title: "Tu forma de pensar", act: "persona" },
  { id: "persona-mapa", title: "Tu mapa interno", act: "persona" },
  { id: "persona-energia", title: "Tu energía", act: "persona" },
  { id: "persona-intereses", title: "Lo que te atrae", act: "persona" },
  { id: "persona-no-atrae", title: "Lo que no te atrae", act: "persona" },
  { id: "persona-vida", title: "Tipo de vida", act: "persona" },
  { id: "persona-resumen", title: "En resumen", act: "persona" },

  // Act 2: Carreras
  { id: "carreras-intro", title: "Los caminos", act: "carreras" },
  { id: "carreras-lista", title: "Tu top 5", act: "carreras" },
  { id: "carreras-detalle", title: "Explorar carrera", act: "carreras" },

  // Act 3: Universidades
  { id: "unis-intro", title: "Dónde construir", act: "universidades" },
  { id: "unis-filtros", title: "Encontrar tu lugar", act: "universidades" },
  { id: "unis-detalle", title: "Ver universidad", act: "universidades" },

  // Act 4: Tu Futuro (disabled)
  { id: "futuro-intro", title: "Tu Futuro", act: "futuro" },
]

export function VocationalJourney({ results }: VocationalJourneyProps) {
  const [currentAct, setCurrentAct] = useState<Act>("persona")
  const [currentChapter, setCurrentChapter] = useState("persona-intro")
  const [completedChapters, setCompletedChapters] = useState<string[]>([])
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)

  // Calculate overall progress
  const progress = Math.round((completedChapters.length / allChapters.length) * 100)

  // Build merged profile: agent data overrides static data
  const mergedProfile: Profile = results?.profile ? {
    ...profileData,
    whatWeSee: {
      ...profileData.whatWeSee,
      mentalArchitecture: {
        intro: profileData.whatWeSee.mentalArchitecture.intro,
        traits: results.profile.cognitive_traits?.traits || profileData.whatWeSee.mentalArchitecture.traits
      },
      energyProfile: {
        intro: profileData.whatWeSee.energyProfile.intro,
        activates: results.profile.energy?.activates || profileData.whatWeSee.energyProfile.activates,
        drains: results.profile.energy?.drains || profileData.whatWeSee.energyProfile.drains,
      },
      interests: {
        intro: profileData.whatWeSee.interests.intro,
        areas: results.profile.interests?.areas || profileData.whatWeSee.interests.areas,
      }
    },
    notAttracted: {
      intro: profileData.notAttracted.intro,
      areas: (results.profile.misaligned_areas?.areas || profileData.notAttracted.areas) as Profile["notAttracted"]["areas"],
      reframe: results.profile.misaligned_areas?.reframe || profileData.notAttracted.reframe,
    },
    lifeStyle: {
      axes: results.profile.lifestyle?.axes || profileData.lifeStyle.axes,
    },
    summary: {
      centralPhrase: results.profile.essence?.corePhrase || profileData.summary.centralPhrase,
      elaboration: results.profile.essence?.elaboration || profileData.summary.elaboration,
      shareableTag: results.profile.essence?.shareableTag || profileData.summary.shareableTag,
    }
  } : profileData

  // Build merged mapa interno data
  const mergedMapaInterno: MapaInternoData = results?.profile?.psychometrics ? {
    riasec: results.profile.psychometrics.riasec || demoMapaInterno.riasec,
    inteligencias: results.profile.psychometrics.intelligences
      ? [...results.profile.psychometrics.intelligences.top, ...results.profile.psychometrics.intelligences.rest]
      : demoMapaInterno.inteligencias,
    dominancia: results.profile.psychometrics.brain_dominance
      ? { quadrants: results.profile.psychometrics.brain_dominance.quadrants as MapaInternoData["dominancia"]["quadrants"], insight: results.profile.psychometrics.brain_dominance.insight }
      : demoMapaInterno.dominancia,
    mips: results.profile.psychometrics.personality || demoMapaInterno.mips,
  } : demoMapaInterno

  // Build merged resumen final data
  const mergedResumen: ResumenFinalData = results?.profile?.essence ? {
    name: "",
    centralPhrase: results.profile.essence.corePhrase,
    shareableTag: results.profile.essence.shareableTag,
    elaboration: results.profile.essence.elaboration,
    orbits: results.profile.essence.constellation.map(node => ({
      label: node.label,
      icon: node.icon,
      tier: node.tier as 1 | 2 | 3,
      color: node.color as "indigo" | "violet" | "emerald" | "amber" | "sky",
    })),
    esencia: {
      riasecCode: results.profile.essence.grid.riasecCode,
      topInteligencia: results.profile.essence.grid.topIntelligence,
      dominanciaStyle: results.profile.essence.grid.dominanceStyle,
      millonPattern: results.profile.essence.grid.millonPattern,
    }
  } : demoResumenFinal

  // Build merged careers from agent data
  const mergedCareers: Career[] = results?.careers?.ranking?.length
    ? transformAgentCareers(results.careers.ranking)
    : careersData

  const navigateTo = useCallback((act: Act, chapter?: string) => {
    // Block navigation to futuro
    if (act === "futuro") return

    setCurrentAct(act)
    if (chapter) {
      setCurrentChapter(chapter)
    } else {
      const firstChapter = allChapters.find(c => c.act === act)
      if (firstChapter) {
        setCurrentChapter(firstChapter.id)
      }
    }
  }, [])

  const markChapterComplete = useCallback((chapterId: string) => {
    if (!completedChapters.includes(chapterId)) {
      setCompletedChapters(prev => [...prev, chapterId])
    }
  }, [completedChapters])

  const goToNextChapter = useCallback(() => {
    const currentIndex = allChapters.findIndex(c => c.id === currentChapter)
    if (currentIndex < allChapters.length - 1) {
      const nextChapter = allChapters[currentIndex + 1]
      // Don't advance to futuro
      if (nextChapter.act === "futuro") return
      markChapterComplete(currentChapter)
      setCurrentChapter(nextChapter.id)
      setCurrentAct(nextChapter.act)
    }
  }, [currentChapter, markChapterComplete])

  const handleSelectCareer = useCallback((career: Career) => {
    setSelectedCareer(career)
    setCurrentChapter("carreras-detalle")
  }, [])

  const handleSelectUniversity = useCallback((university: University) => {
    setSelectedUniversity(university)
    setCurrentChapter("unis-detalle")
  }, [])

  const handleBackFromDetail = useCallback(() => {
    if (currentAct === "carreras") {
      setSelectedCareer(null)
      setCurrentChapter("carreras-lista")
    } else if (currentAct === "universidades") {
      setSelectedUniversity(null)
      setCurrentChapter("unis-filtros")
    }
  }, [currentAct])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <JourneySidebar
        currentAct={currentAct}
        currentChapter={currentChapter}
        chapters={allChapters}
        onNavigate={navigateTo}
        completedChapters={completedChapters}
      />

      {/* Mobile Navigation */}
      <MobileNav
        currentAct={currentAct}
        onNavigate={(act) => navigateTo(act)}
        progress={progress}
      />

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24 lg:pt-0 lg:pb-0">
        {currentAct === "persona" && (
          <ActPersona
            profile={mergedProfile}
            currentChapter={currentChapter}
            onNextChapter={goToNextChapter}
            onNavigateToCarreras={() => navigateTo("carreras", "carreras-intro")}
            mapaInternoData={mergedMapaInterno}
            resumenData={mergedResumen}
          />
        )}

        {currentAct === "carreras" && (
          <ActCarreras
            careers={mergedCareers}
            currentChapter={currentChapter}
            selectedCareer={selectedCareer}
            onSelectCareer={handleSelectCareer}
            onBack={handleBackFromDetail}
            onNextChapter={goToNextChapter}
            onNavigateToUniversidades={() => navigateTo("universidades", "unis-intro")}
          />
        )}

        {currentAct === "universidades" && (
          <ActUniversidades
            universities={universitiesData}
            careers={mergedCareers}
            currentChapter={currentChapter}
            selectedUniversity={selectedUniversity}
            onSelectUniversity={handleSelectUniversity}
            onBack={handleBackFromDetail}
            onNextChapter={goToNextChapter}
            onNavigateToFuturo={() => {}}
          />
        )}

        {currentAct === "futuro" && (
          <ActFuturo
            currentChapter={currentChapter}
            onNextChapter={goToNextChapter}
          />
        )}
      </main>
    </div>
  )
}
