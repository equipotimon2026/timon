'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Render estructurado de results.meta.rationale (canonicalProfile + decisionTrail).
// Todo es defensivo: cada bloque se muestra solo si la data existe.

function Badge({ value }: { value?: string | null }) {
  if (!value) return null;
  const v = value.toLowerCase();
  const cls =
    v === 'high'
      ? 'bg-green-100 text-green-700'
      : v === 'medium'
      ? 'bg-amber-100 text-amber-700'
      : v === 'low'
      ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-600';
  return <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${cls}`}>{value}</span>;
}

function Chips({ items, tone = 'gray' }: { items?: any[]; tone?: string }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const cls =
    tone === 'green'
      ? 'bg-green-50 text-green-700 border-green-200'
      : tone === 'red'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span key={i} className={`rounded-full border px-2 py-0.5 text-xs ${cls}`}>
          {typeof it === 'string' ? it : JSON.stringify(it)}
        </span>
      ))}
    </div>
  );
}

function Sources({ sources }: { sources?: any[] }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  return (
    <p className="mt-1 text-[11px] text-gray-400">
      Fuentes: {sources.map((s) => String(s)).join(', ')}
    </p>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      {children}
    </div>
  );
}

// Render genérico para decisionTrail (shape desconocida / 5 agentes).
function JsonTree({ data, depth = 0 }: { data: any; depth?: number }) {
  if (data === null || data === undefined) return <span className="text-gray-400">—</span>;
  if (typeof data !== 'object') {
    return <span className="text-gray-800">{String(data)}</span>;
  }
  if (Array.isArray(data)) {
    return (
      <ul className="ml-3 list-disc space-y-1">
        {data.map((item, i) => (
          <li key={i}>
            <JsonTree data={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={depth > 0 ? 'ml-3 space-y-1' : 'space-y-1'}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <span className="text-xs font-semibold text-gray-600">{k}:</span>{' '}
          <JsonTree data={v} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

export function RationaleView({ rationale }: { rationale: any }) {
  if (!rationale) {
    return (
      <p className="text-sm text-gray-500">
        Este resultado no incluye análisis del agente (meta.rationale ausente).
      </p>
    );
  }

  const cp = rationale.canonicalProfile ?? {};
  const cognitiveTraits: any[] = cp.cognitive_profile?.traits ?? [];
  const mot = cp.motivational_profile ?? {};
  const identity = cp.identity ?? {};
  const axes: any[] = cp.lifestyle_preferences?.axes ?? [];
  const essence = cp.essence ?? {};
  const reasoning: any[] = cp.reasoning ?? [];
  const expect = cp.expectation_alignment ?? null;

  return (
    <div className="space-y-4">
      {rationale._note && (
        <p className="rounded bg-gray-50 p-2 text-xs italic text-gray-500">{rationale._note}</p>
      )}

      {/* Essence */}
      {(essence.corePhrase || essence.persona || essence.grid) && (
        <Section title="Esencia">
          {essence.persona?.label && (
            <p className="text-sm">
              <span className="font-medium">Persona:</span> {essence.persona.label}
              {essence.persona.id ? ` (${essence.persona.id})` : ''}
            </p>
          )}
          {essence.corePhrase && <p className="mt-1 text-sm italic text-gray-700">“{essence.corePhrase}”</p>}
          {essence.shareableTag && <p className="mt-1 text-xs text-gray-500">{essence.shareableTag}</p>}
          {essence.grid && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-4">
              {essence.grid.riasecCode && <div><span className="text-gray-400">RIASEC:</span> {essence.grid.riasecCode}</div>}
              {essence.grid.topIntelligence && <div><span className="text-gray-400">Top intel.:</span> {essence.grid.topIntelligence}</div>}
              {essence.grid.dominanceStyle && <div><span className="text-gray-400">Dominancia:</span> {essence.grid.dominanceStyle}</div>}
              {essence.grid.millonPattern && <div><span className="text-gray-400">Millon:</span> {essence.grid.millonPattern}</div>}
            </div>
          )}
          {essence.elaboration && <p className="mt-2 text-sm text-gray-700">{essence.elaboration}</p>}
          {Array.isArray(essence.constellation) && essence.constellation.length > 0 && (
            <div className="mt-2">
              <Chips items={essence.constellation.map((c: any) => `${c.icon ?? ''} ${c.label ?? ''}`.trim())} />
            </div>
          )}
        </Section>
      )}

      {/* Cognitive traits */}
      {cognitiveTraits.length > 0 && (
        <Section title="Perfil cognitivo (traits)">
          <ul className="space-y-3">
            {cognitiveTraits.map((t, i) => (
              <li key={i} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900">
                  {t.name}
                  {t.levelLabel && <span className="ml-2 text-xs text-gray-500">{t.levelLabel}</span>}
                  {typeof t.level === 'number' && <span className="ml-1 text-xs text-gray-400">({t.level})</span>}
                  {t.isTension && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">tensión</span>}
                </p>
                {t.description && <p className="mt-0.5 text-sm text-gray-600">{t.description}</p>}
                <Sources sources={t.sources} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Motivational */}
      {(mot.activates || mot.drains || mot.interests || mot.misaligned_areas || mot.reframe) && (
        <Section title="Perfil motivacional">
          {Array.isArray(mot.activates) && mot.activates.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-gray-500">Activa</p>
              <Chips items={mot.activates} tone="green" />
            </div>
          )}
          {Array.isArray(mot.drains) && mot.drains.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-gray-500">Drena</p>
              <Chips items={mot.drains} tone="red" />
            </div>
          )}
          {Array.isArray(mot.interests) && mot.interests.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-gray-500">Intereses</p>
              <ul className="space-y-1">
                {mot.interests.map((it: any, i: number) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{it.name}</span>
                    {it.levelLabel && <span className="ml-1 text-xs text-gray-500">{it.levelLabel}</span>}
                    {typeof it.score === 'number' && <span className="ml-1 text-xs text-gray-400">({it.score})</span>}
                    {it.insight && <span className="block text-xs text-gray-500">{it.insight}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(mot.misaligned_areas) && mot.misaligned_areas.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-gray-500">Áreas desalineadas</p>
              <ul className="space-y-1">
                {mot.misaligned_areas.map((m: any, i: number) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{m.name}</span>
                    <Badge value={m.inferenceStrength} />
                    {m.description && <span className="block text-xs text-gray-500">{m.description}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mot.reframe && <p className="mt-2 text-sm italic text-gray-600">{mot.reframe}</p>}
        </Section>
      )}

      {/* Identity */}
      {(identity.decision_context || identity.core_tensions || typeof identity.decision_clarity === 'number') && (
        <Section title="Identidad / decisión">
          {typeof identity.decision_clarity === 'number' && (
            <p className="text-sm text-gray-700">
              Claridad de decisión: <span className="font-medium">{identity.decision_clarity}</span>
            </p>
          )}
          {identity.decision_context && <p className="mt-1 text-sm text-gray-600">{identity.decision_context}</p>}
          {Array.isArray(identity.core_tensions) && identity.core_tensions.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-gray-500">Tensiones centrales</p>
              <ul className="space-y-2">
                {identity.core_tensions.map((ct: any, i: number) => (
                  <li key={i} className="text-sm text-gray-700">
                    {ct.description}
                    <Sources sources={ct.sources} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Lifestyle axes */}
      {axes.length > 0 && (
        <Section title="Preferencias de estilo de vida">
          <ul className="space-y-2">
            {axes.map((a, i) => (
              <li key={i} className="text-sm text-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{a.leftLabel}</span>
                  <span>{a.rightLabel}</span>
                </div>
                {typeof a.value === 'number' && (
                  <div className="my-1 h-1.5 w-full rounded bg-gray-200">
                    <div className="h-1.5 rounded bg-indigo-500" style={{ width: `${Math.max(0, Math.min(100, a.value))}%` }} />
                  </div>
                )}
                {a.interpretation && <p className="text-xs text-gray-600">{a.interpretation}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Reasoning */}
      {reasoning.length > 0 && (
        <Section title="Razonamiento por sección">
          <ul className="space-y-3">
            {reasoning.map((r, i) => (
              <li key={i} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900">
                  {r.section}
                  <Badge value={r.confidence} />
                </p>
                {r.conclusion && <p className="mt-0.5 text-sm text-gray-700">{r.conclusion}</p>}
                {Array.isArray(r.evidence) && r.evidence.length > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-xs text-gray-500">
                    {r.evidence.map((e: any, j: number) => (
                      <li key={j}>{String(e)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Expectation alignment */}
      {expect && (
        <Section title="Alineación de expectativas">
          {expect.status && (
            <p className="text-sm">
              Estado: <span className="font-medium">{expect.status}</span>
              <Badge value={expect.inferenceStrength} />
            </p>
          )}
          {expect.summary && <p className="mt-1 text-sm text-gray-700">{expect.summary}</p>}
          {Array.isArray(expect.agreements) && expect.agreements.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-gray-500">Acuerdos</p>
              <Chips items={expect.agreements} tone="green" />
            </div>
          )}
          {Array.isArray(expect.frictions) && expect.frictions.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-gray-500">Fricciones</p>
              <Chips items={expect.frictions} tone="red" />
            </div>
          )}
        </Section>
      )}

      {/* Decision trail (shape variable → árbol genérico) */}
      {rationale.decisionTrail && (
        <Section title="Traza de decisiones (agentes)">
          <div className="text-sm">
            <JsonTree data={rationale.decisionTrail} />
          </div>
        </Section>
      )}
    </div>
  );
}
