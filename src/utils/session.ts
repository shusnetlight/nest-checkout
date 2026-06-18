import { NESTS } from '../data/nests'

export function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function fromSlug(slug: string): string {
  return NESTS.find(n => toSlug(n.name) === slug)?.name ?? slug
}
