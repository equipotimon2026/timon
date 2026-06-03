"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useWizardStore } from "@/stores/wizard-store"
import { cn } from "@/lib/utils"

interface UserHeaderProps {
  userName: string
}

export function UserHeader({ userName = "Usuario" }: UserHeaderProps) {
  const { signOut } = useAuthStore();
  const { steps, onStepClick } = useWizardStore();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4">
      <h1 className="hidden shrink-0 text-2xl font-semibold text-foreground sm:block">{userName}</h1>

      {steps && (
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
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
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Sesion activa</p>
            </div>
          </DropdownMenuLabel>
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
    </div>
  )
}
