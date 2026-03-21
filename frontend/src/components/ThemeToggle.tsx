"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Alternar tema"
    >
      <FontAwesomeIcon icon={faSun} className="h-[1.2rem] w-[1.2rem] scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <FontAwesomeIcon icon={faMoon} className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
