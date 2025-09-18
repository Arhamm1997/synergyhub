"use client"

import * as React from "react"
import { useTheme as useNextTheme } from "next-themes"
import { create } from "zustand"

type Theme = "dark" | "light" | "system"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const useThemeStore = create<ThemeProviderState>((set) => ({
  theme: "system",
  setTheme: (theme) => set({ theme }),
}))

export function useTheme() {
  return useThemeStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }))
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
} & React.ComponentProps<typeof NextThemesProvider>

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setNextTheme(theme)
  }, [theme, setNextTheme])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
