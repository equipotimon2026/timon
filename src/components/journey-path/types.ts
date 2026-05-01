export type StepStatus = "done" | "current" | "active" | "locked"

export interface JourneyStepData {
  id: string
  order: number
  title: string
  subtitle: string
  status: StepStatus
  /** Module accent color */
  color: {
    accent: string
    bg: string
    glow: string
  }
  /** Optional progress like "2/4" for active steps */
  progress?: string
  /** Callback when clicking the step */
  onClick?: () => void
}

export interface JourneyPathProps {
  steps: JourneyStepData[]
  /** Username for the greeting header */
  userName?: string
  /** Overall completion percentage (0-100) */
  completionPercent?: number
  className?: string
}
