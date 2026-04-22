"use client"

import { Profile } from "@/lib/profile-data"
import {
  ChapterHeader,
  TransitionBlock,
  InsightCard,
  ProseBlock,
  ProgressBar,
  CTAButton,
  StickyCTA
} from "@/components/journey/narrative-blocks"
import { ChapterMapaInterno, demoMapaInterno } from "@/components/chapters/chapter-mapa-interno"
import type { MapaInternoData } from "@/components/chapters/chapter-mapa-interno"
import { ChapterResumenFinal, demoResumenFinal } from "@/components/chapters/chapter-resumen-final"
import type { ResumenFinalData } from "@/components/chapters/chapter-resumen-final"
import { cn } from "@/lib/utils"

interface ActPersonaProps {
  profile: Profile
  currentChapter: string
  onNextChapter: () => void
  onNavigateToCarreras: () => void
  mapaInternoData?: MapaInternoData
  resumenData?: ResumenFinalData
}

export function ActPersona({
  profile,
  currentChapter,
  onNextChapter,
  onNavigateToCarreras,
  mapaInternoData,
  resumenData,
}: ActPersonaProps) {

  const renderChapter = () => {
    switch (currentChapter) {
      case "persona-intro":
        return <ChapterIntro profile={profile} onNext={onNextChapter} />
      case "persona-como":
        return <ChapterComo profile={profile} onNext={onNextChapter} />
      case "persona-mente":
        return <ChapterMente profile={profile} onNext={onNextChapter} />
      case "persona-mapa":
        return <ChapterMapaInterno data={mapaInternoData || demoMapaInterno} onNext={onNextChapter} />
      case "persona-energia":
        return <ChapterEnergia profile={profile} onNext={onNextChapter} />
      case "persona-intereses":
        return <ChapterIntereses profile={profile} onNext={onNextChapter} />
      case "persona-no-atrae":
        return <ChapterNoAtrae profile={profile} onNext={onNextChapter} />
      case "persona-vida":
        return <ChapterVida profile={profile} onNext={onNextChapter} />
      case "persona-resumen":
        return <ChapterResumenFinal data={resumenData || demoResumenFinal} onNext={onNavigateToCarreras} />
      default:
        return <ChapterIntro profile={profile} onNext={onNextChapter} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderChapter()}
    </div>
  )
}

// Chapter: Intro / Welcome
function ChapterIntro({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <div className="animate-fade-in-up">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-6">
            Acto 01 — Entenderte
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-tight mb-8">
            Este es el comienzo de algo importante
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {profile.opening.welcomeText}
          </p>
        </div>

        <TransitionBlock variant="highlight">
          {profile.opening.purposeStatement}
        </TransitionBlock>

        <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CTAButton onClick={onNext} size="large">
            Comenzar el recorrido
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

// Chapter: How we built this
function ChapterComo({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="01"
          title="Cómo llegamos hasta acá"
          subtitle="Lo que hiciste y lo que nos dice"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            {profile.methodology.intro}
          </p>
        </ProseBlock>

        <div className="space-y-4 my-10 stagger-children">
          {profile.methodology.dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-card border border-border/50"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-serif text-lg">
                  {idx + 1}
                </span>
                <h3 className="font-medium text-foreground">{dim.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dim.description}
              </p>
            </div>
          ))}
        </div>

        <InsightCard
          quote={profile.methodology.clarification}
          variant="primary"
        />

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Tu forma de pensar"
        />
      </div>
    </section>
  )
}

// Chapter: Mental Architecture
function ChapterMente({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  const traits = profile.whatWeSee.mentalArchitecture.traits
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="02"
          title="Tu forma de pensar"
          subtitle="Cómo procesás la información y resolvés problemas"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {profile.whatWeSee.mentalArchitecture.intro}
          </p>
        </ProseBlock>

        <div className="my-10 space-y-6">
          {traits.map((trait, idx) => (
            <div
              key={idx}
              className={cn(
                "p-6 rounded-2xl animate-fade-in-up",
                idx % 2 === 0 ? "bg-secondary/30" : "bg-muted/50",
                trait.isTension && "border-amber-200/50 border"
              )}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <h3 className="font-serif text-lg text-foreground mb-1">{trait.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{trait.levelLabel}</p>
              <p className="text-muted-foreground">{trait.description}</p>
              <div className="mt-4">
                <ProgressBar
                  value={trait.level}
                  label="Nivel detectado"
                  color={idx % 2 === 0 ? "primary" : "secondary"}
                />
              </div>
            </div>
          ))}
        </div>

        <TransitionBlock>
          Esto no define lo que podés hacer. Define cómo lo hacés naturalmente.
        </TransitionBlock>

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Tu energía"
        />
      </div>
    </section>
  )
}

// Chapter: Energy Profile
function ChapterEnergia({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="04"
          title="Tu energía"
          subtitle="Qué te activa y qué te agota"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {profile.whatWeSee.energyProfile.intro}
          </p>
        </ProseBlock>

        <div className="grid gap-6 my-10">
          {/* What activates */}
          <div className="p-6 rounded-2xl bg-accent/20 border border-accent/30">
            <h3 className="font-serif text-lg text-foreground mb-4">Lo que te activa</h3>
            <ul className="space-y-3">
              {profile.whatWeSee.energyProfile.activates.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-foreground mt-2" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What drains */}
          <div className="p-6 rounded-2xl bg-muted/50 border border-border/50">
            <h3 className="font-serif text-lg text-foreground mb-4">Lo que te agota</h3>
            <ul className="space-y-3">
              {profile.whatWeSee.energyProfile.drains.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <InsightCard
          quote="Conocer tu energía te ayuda a elegir caminos que puedas sostener en el tiempo, no solo empezar."
          variant="default"
        />

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Lo que te atrae"
        />
      </div>
    </section>
  )
}

// Chapter: Interests
function ChapterIntereses({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="05"
          title="Lo que te atrae"
          subtitle="Tus intereses y afinidades"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            {profile.whatWeSee.interests.intro}
          </p>
        </ProseBlock>

        <div className="space-y-4 my-10 stagger-children">
          {profile.whatWeSee.interests.areas.map((area, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">{area.name}</h3>
                <span className="text-sm font-medium text-muted-foreground">{area.levelLabel}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary/70 rounded-full transition-all duration-700"
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{area.insight}</p>
            </div>
          ))}
        </div>

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Tipo de vida"
        />
      </div>
    </section>
  )
}

// Chapter: Not Attracted
function ChapterNoAtrae({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="06"
          title="Lo que (probablemente) no va con vos"
          subtitle="No para juzgar, sino para delimitar"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            {profile.notAttracted.intro}
          </p>
        </ProseBlock>

        <div className="space-y-4 my-10">
          {profile.notAttracted.areas.map((area, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-muted/40 border border-border/40"
            >
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground/70">{area.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{area.description}</p>
                  {area.inferenceStrength === "tentativa" && (
                    <p className="text-xs text-muted-foreground/60 mt-2 italic">
                      Esto es una tendencia, no una certeza.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <InsightCard
          quote={profile.notAttracted.reframe}
          variant="default"
        />

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Tu tipo de vida ideal"
        />
      </div>
    </section>
  )
}

// Chapter: Lifestyle
function ChapterVida({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="07"
          title="Tu tipo de vida ideal"
          subtitle="Cómo te imaginás viviendo"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            No se trata solo de qué querés hacer, sino de cómo querés vivir mientras lo hacés.
          </p>
        </ProseBlock>

        <div className="space-y-8 my-10">
          {profile.lifeStyle.axes.map((axis, idx) => (
            <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">{axis.leftLabel}</span>
                <span className="text-muted-foreground">{axis.rightLabel}</span>
              </div>
              <div className="relative h-3 bg-muted rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full shadow-lg border-2 border-background transition-all duration-500"
                  style={{ left: `calc(${axis.value}% - 10px)` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-primary/20 rounded-full transition-all duration-500"
                  style={{ width: `${axis.value}%` }}
                />
              </div>
              <p className="text-sm text-foreground/70 mt-3">
                {axis.interpretation}
              </p>
            </div>
          ))}
        </div>

        <InsightCard
          quote="Elegir una carrera es también elegir un estilo de vida. Los mejores caminos son los que se alinean con ambos."
          variant="accent"
        />

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Tu resumen"
        />
      </div>
    </section>
  )
}

// Chapter: Summary
function ChapterResumen({ profile, onNext }: { profile: Profile; onNext: () => void }) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="07"
          title="En resumen"
          subtitle="Lo esencial de lo que descubrimos"
        />

        <div className="my-12 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 border border-primary/10">
          <p className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed text-center text-balance">
            {profile.summary.centralPhrase}
          </p>
          <p className="text-sm tracking-widest text-muted-foreground uppercase text-center mt-4 mb-8">
            {profile.summary.shareableTag}
          </p>
        </div>

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-6">
            {profile.summary.elaboration}
          </p>
        </ProseBlock>

        <TransitionBlock variant="bridge">
          Ya entendimos ciertas cosas de vos. Con eso, empiezan a aparecer caminos posibles. Veamos cuáles hacen más sentido.
        </TransitionBlock>

        <div className="mt-12 text-center">
          <CTAButton onClick={onNext} size="large">
            Ver los caminos que aparecen
          </CTAButton>
        </div>
      </div>
    </section>
  )
}
