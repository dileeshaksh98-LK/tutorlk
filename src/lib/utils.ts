import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `LKR ${(amount ?? 0).toLocaleString('en-LK')}`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-LK', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function daysUntil(date: Date | string | null | undefined): number {
  if (!date) return 0
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getPlatformFee(amount: number): number {
  return Math.round((amount ?? 0) * 0.05)
}

export function getTutorAmount(amount: number): number {
  return (amount ?? 0) - getPlatformFee(amount)
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function truncate(text: string, length: number): string {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '…' : text
}

export function getInitials(name: string): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
