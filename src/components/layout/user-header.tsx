"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

interface UserHeaderProps {
  userName: string
  onSignOut: () => void
}

export function UserHeader({ userName = "Usuario", onSignOut }: UserHeaderProps) {
  const handleLogout = () => {
    onSignOut();
  };

  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <h1 className="text-2xl font-semibold text-foreground">{userName}</h1>

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
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Configuracion
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
