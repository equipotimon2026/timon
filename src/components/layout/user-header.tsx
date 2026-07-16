"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Copy, Check, CreditCard } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useWizardStore } from "@/stores/wizard-store"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface UserHeaderProps {
  userName: string
}

interface ReferralInfo {
  myCode: string
  myGroupSize: number
  usedCode: string | null
  usedGroupSize: number
  ownerEmail: string | null
  groupSizeThreshold: number
  discountPct: number
}

export function UserHeader({ userName = "Usuario" }: UserHeaderProps) {
  const { signOut } = useAuthStore();
  const { steps, onStepClick } = useWizardStore();
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  const fetchReferral = useCallback(async () => {
    setReferralLoading(true);
    try {
      const res = await fetch("/api/referrals/me");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReferralInfo = await res.json();
      setReferral(data);
    } catch {
      // silencioso: bloque de referidos simplemente no se muestra
    } finally {
      setReferralLoading(false);
    }
  }, []);

  function handleDropdownOpenChange(open: boolean) {
    if (open) {
      setCodeError(null);
      if (!referral && !referralLoading) {
        fetchReferral();
      }
    }
  }

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!referral) return;
    navigator.clipboard
      .writeText(referral.myCode)
      .then(() => {
        setCopyError(false);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("[user-header] no se pudo copiar el código:", err);
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      });
  }

  async function applyCode() {
    setCodeError(null);
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const res = await fetch("/api/referrals/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCodeError(body.error || "Código inválido");
        return;
      }
      setCodeInput("");
      fetchReferral();
    } catch {
      setCodeError("Error de red. Reintentá.");
    } finally {
      setApplying(false);
    }
  }

  async function handleApplyCode(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await applyCode();
  }

  function handleCodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      applyCode();
    }
  }

  function handleOpenPlanDialog() {
    if (!referral && !referralLoading) {
      fetchReferral();
    }
    setPlanDialogOpen(true);
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
      <h1 className="hidden shrink-0 text-2xl font-semibold text-foreground sm:block">{userName}</h1>

      {steps && (
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex w-full items-center gap-1 rounded-full border border-border bg-muted/40 p-1 sm:w-auto">
            {steps.map((step, i) => {
              const isActive = step.status === "active"
              const isLocked = step.status === "locked" && !step.loading
              return (
                <button
                  key={step.label}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && onStepClick?.(i)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all sm:flex-none sm:px-4 sm:py-1.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isLocked
                        ? "cursor-not-allowed text-muted-foreground/50"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.loading && (
                    <span
                      className={cn(
                        "h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent",
                        isActive ? "border-primary-foreground" : "border-muted-foreground"
                      )}
                    />
                  )}
                  {step.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <DropdownMenu onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-10 w-10 shrink-0 rounded-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Sesion activa</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="px-2 py-2">
            <p className="mb-1.5 text-xs font-medium text-foreground">Tu código de amigos</p>
            {referralLoading && !referral ? (
              <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
            ) : referral ? (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <code className="flex-1 rounded-md border bg-muted/40 px-2 py-1.5 text-center text-sm font-bold tracking-[0.2em]">
                    {referral.myCode}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-md border p-1.5 hover:bg-muted"
                    aria-label="Copiar código"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {copyError && (
                  <p className="mb-2 text-xs text-red-600">No se pudo copiar</p>
                )}
                <p className="mb-2 text-xs text-muted-foreground">
                  {referral.myGroupSize}/{referral.groupSizeThreshold} amigos — al llegar a{" "}
                  {referral.groupSizeThreshold}, {referral.discountPct}% off para todos.
                </p>

                {referral.usedCode === null ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="mb-1.5 text-xs font-medium text-foreground">¿Te pasaron un código?</p>
                    <div className="flex gap-1.5">
                      <input
                        value={codeInput}
                        onChange={(e) => {
                          setCodeInput(e.target.value.toUpperCase());
                          setCodeError(null);
                        }}
                        placeholder="CÓDIGO"
                        maxLength={6}
                        onKeyDown={handleCodeKeyDown}
                        className="flex-1 rounded-md border px-2 py-1.5 text-xs uppercase tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCode}
                        disabled={applying}
                        className="rounded-md border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-60"
                      >
                        {applying ? "..." : "Aplicar"}
                      </button>
                    </div>
                    {codeError && <p className="mt-1.5 text-xs text-red-600">{codeError}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Usaste el código{" "}
                    <span className="font-mono font-semibold">{referral.usedCode}</span>
                  </p>
                )}
              </>
            ) : null}
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer" onSelect={handleOpenPlanDialog}>
            <CreditCard className="h-4 w-4" />
            Mi plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer">
            <Settings className="h-4 w-4" />
            Configuracion
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => signOut()}
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {referralLoading && !referral ? (
            <div className="space-y-2 py-4">
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ) : referral && referral.usedCode === null ? (
            <>
              <DialogHeader>
                <DialogTitle>Plan Individual</DialogTitle>
                <DialogDescription>
                  Ingresá el código de un amigo para pasarte al plan grupal: cuando el grupo
                  llega a {referral.groupSizeThreshold} personas, todos pagan{" "}
                  {referral.discountPct}% menos.
                </DialogDescription>
              </DialogHeader>
              {referral.myGroupSize > 1 && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  {referral.myGroupSize >= referral.groupSizeThreshold ? (
                    <p className="font-medium text-foreground">
                      ¡Grupo completo! Tenés {referral.discountPct}% de descuento.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Tu grupo: {referral.myGroupSize}/{referral.groupSizeThreshold} — sos el
                      dueño del código{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {referral.myCode}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </>
          ) : referral && referral.usedCode !== null ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>Plan Amigos</DialogTitle>
                  {referral.usedGroupSize >= referral.groupSizeThreshold && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Completo
                    </span>
                  )}
                </div>
                <DialogDescription>
                  Grupo de {referral.ownerEmail ?? "un amigo"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {referral.usedGroupSize}/{referral.groupSizeThreshold} personas
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (referral.usedGroupSize / referral.groupSizeThreshold) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {referral.usedGroupSize >= referral.groupSizeThreshold
                    ? `¡Grupo completo! ${referral.discountPct}% de descuento activo.`
                    : `Faltan ${referral.groupSizeThreshold - referral.usedGroupSize} para activar el ${referral.discountPct}% de descuento.`}
                </p>
              </div>
            </>
          ) : (
            <DialogHeader>
              <DialogTitle>Mi plan</DialogTitle>
              <DialogDescription>No pudimos cargar tu plan. Reintentá más tarde.</DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
