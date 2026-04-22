"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, Quote, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { ReactNode } from "react"

// Chapter Header
interface ChapterHeaderProps {
  number: string
  title: string
  subtitle?: string
}

export function ChapterHeader({ number, title, subtitle }: ChapterHeaderProps) {
  return (
    <header className="mb-12 animate-fade-in-up">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-6xl md:text-7xl font-serif font-light text-primary/20">
          {number}
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-serif text-foreground leading-tight text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          {subtitle}
        </p>
      )}
    </header>
  )
}

// Narrative Transition Block
interface TransitionBlockProps {
  children: ReactNode
  variant?: "default" | "highlight" | "bridge"
}

export function TransitionBlock({ children, variant = "default" }: TransitionBlockProps) {
  return (
    <div className={cn(
      "py-16 my-12 border-y border-border/30 animate-fade-in",
      variant === "highlight" && "bg-secondary/30 -mx-6 px-6 md:-mx-12 md:px-12 rounded-2xl border-none",
      variant === "bridge" && "bg-gradient-to-b from-transparent via-muted/30 to-transparent"
    )}>
      <p className="text-xl md:text-2xl font-serif text-foreground/80 leading-relaxed max-w-2xl text-balance">
        {children}
      </p>
    </div>
  )
}

// Highlight Quote / Insight Card
interface InsightCardProps {
  quote: string
  context?: string
  variant?: "default" | "primary" | "accent"
}

export function InsightCard({ quote, context, variant = "default" }: InsightCardProps) {
  return (
    <div className={cn(
      "relative p-8 md:p-10 rounded-2xl my-10 animate-fade-in-up",
      variant === "default" && "bg-muted/50 border border-border/50",
      variant === "primary" && "bg-primary/5 border border-primary/20",
      variant === "accent" && "bg-accent/30 border border-accent/50"
    )}>
      <Quote className={cn(
        "absolute top-6 left-6 w-8 h-8 opacity-20",
        variant === "primary" && "text-primary",
        variant === "accent" && "text-accent-foreground"
      )} />
      <blockquote className="text-xl md:text-2xl font-serif text-foreground leading-relaxed pl-8">
        {quote}
      </blockquote>
      {context && (
        <p className="mt-6 text-sm text-muted-foreground pl-8">
          {context}
        </p>
      )}
    </div>
  )
}

// Prose Block for long-form text
interface ProseBlockProps {
  children: ReactNode
  className?: string
}

export function ProseBlock({ children, className }: ProseBlockProps) {
  return (
    <div className={cn(
      "prose prose-lg max-w-none",
      "prose-headings:font-serif prose-headings:text-foreground",
      "prose-p:text-foreground/80 prose-p:leading-relaxed",
      "prose-strong:text-foreground prose-strong:font-semibold",
      "prose-ul:text-foreground/80 prose-li:marker:text-primary/50",
      className
    )}>
      {children}
    </div>
  )
}

// Status Indicator
interface StatusIndicatorProps {
  status: "optimal" | "alert" | "neutral"
  label: string
  description?: string
}

export function StatusIndicator({ status, label, description }: StatusIndicatorProps) {
  const statusConfig = {
    optimal: {
      icon: CheckCircle2,
      bg: "bg-accent/20",
      border: "border-accent/40",
      text: "text-accent-foreground",
      iconColor: "text-accent-foreground",
    },
    alert: {
      icon: AlertCircle,
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      iconColor: "text-amber-600",
    },
    neutral: {
      icon: Sparkles,
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
      iconColor: "text-muted-foreground",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn(
      "flex items-start gap-4 p-5 rounded-xl border",
      config.bg,
      config.border
    )}>
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconColor)} />
      <div>
        <p className={cn("font-medium", config.text)}>{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

// Progress Bar
interface ProgressBarProps {
  value: number
  label: string
  color?: "primary" | "secondary" | "accent"
}

export function ProgressBar({ value, label, color = "primary" }: ProgressBarProps) {
  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary-foreground",
    accent: "bg-accent-foreground",
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", colorClasses[color])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// CTA Button
interface CTAButtonProps {
  children: ReactNode
  onClick: () => void
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "large"
}

export function CTAButton({ children, onClick, variant = "primary", size = "default" }: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-3 font-medium rounded-xl transition-all duration-200",
        size === "default" && "px-6 py-3 text-base",
        size === "large" && "px-8 py-4 text-lg",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "text-primary hover:bg-primary/5"
      )}
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  )
}

// Sticky CTA Footer
interface StickyCTAProps {
  label: string
  onClick: () => void
  hint?: string
}

export function StickyCTA({ label, onClick, hint }: StickyCTAProps) {
  return (
    <div className="fixed bottom-20 lg:bottom-8 left-0 right-0 z-40 px-4 lg:px-8 pointer-events-none">
      <div className="max-w-3xl mx-auto">
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between gap-4">
            {hint && (
              <p className="text-sm text-muted-foreground hidden sm:block">{hint}</p>
            )}
            <CTAButton onClick={onClick} size="default">
              {label}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  )
}
