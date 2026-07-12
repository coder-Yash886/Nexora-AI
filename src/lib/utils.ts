import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds))

  const hours = total / 3600
  if (hours >= 1) {
    const h = Math.round(hours)
    return `${h} hour${h === 1 ? "" : "s"}`
  }

  const minutes = total / 60
  if (minutes >= 1) {
    const m = Math.round(minutes)
    return `${m} minute${m === 1 ? "" : "s"}`
  }

  return `${total} second${total === 1 ? "" : "s"}`
}
