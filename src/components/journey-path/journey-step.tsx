"use client"

import { cn } from "@/lib/utils"
import { JourneyNode } from "./journey-node"
import { JourneyCard } from "./journey-card"
import type { JourneyStepData } from "./types"

interface JourneyStepProps {
  step: JourneyStepData
  /** 0-based index, used for zigzag alternation */
  index: number
}

export function JourneyStep({ step, index }: JourneyStepProps) {
  const isEven = index % 2 !== 0 // first step is left (odd=right)

  return (
    <div
      className={cn(
        "flex items-center gap-4 sm:gap-5 lg:gap-6",
        "w-[84%] sm:w-[70%] lg:w-[60%] xl:w-[54%]",
        isEven ? "self-end flex-row-reverse" : "self-start"
      )}
    >
      <JourneyNode
        order={step.order}
        status={step.status}
        accentColor={step.color.accent}
        glowColor={step.color.glow}
      />
      <JourneyCard
        title={step.title}
        subtitle={step.subtitle}
        status={step.status}
        accentColor={step.color.accent}
        bgColor={step.color.bg}
        glowColor={step.color.glow}
        isEven={isEven}
        progress={step.progress}
        onClick={step.onClick}
      />
    </div>
  )
}
