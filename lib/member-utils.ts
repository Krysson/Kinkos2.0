import { differenceInYears, parseISO, isAfter, subDays, addYears } from 'date-fns'
import type { Member, MemberStatus } from '@/lib/types'

export type CheckInValidation = {
  allowed: boolean
  reason?: string
}

/**
 * Checks if a member can check in
 */
export function canCheckIn(
  member: Member,
  hasValidWaiver: boolean,
  currentOccupancy: number,
  maxOccupancy: number = 140
): CheckInValidation {
  // Check member status
  if (member.status === 'suspended') {
    return {
      allowed: false,
      reason: 'Member is suspended and cannot check in'
    }
  }

  if (member.status === 'inactive') {
    return {
      allowed: false,
      reason: 'Membership is inactive.'
    }
  }

  // Check waiver
  if (!hasValidWaiver) {
    return {
      allowed: false,
      reason: 'Valid waiver required. Please sign a new waiver'
    }
  }

  // Check capacity
  if (currentOccupancy >= maxOccupancy) {
    return {
      allowed: false,
      reason: `Venue is at capacity (${maxOccupancy}). Please wait for someone to check out`
    }
  }

  // All checks passed
  return { allowed: true }
}

/**
 * Checks if occupancy is approaching capacity
 */
export function isApproachingCapacity(
  currentOccupancy: number,
  maxOccupancy: number = 140,
  warningThreshold: number = 0.9
): boolean {
  return currentOccupancy >= maxOccupancy * warningThreshold
}

/**
 * Checks if a waiver is expired
 */
export function isWaiverExpired(validUntil: string): boolean {
  const expiryDate = parseISO(validUntil)
  return !isAfter(expiryDate, new Date())
}

/**
 * Checks if a waiver is expiring soon (within 30 days)
 */
export function isWaiverExpiringSoon(validUntil: string, daysThreshold: number = 30): boolean {
  const expiryDate = parseISO(validUntil)
  const thresholdDate = addYears(new Date(), 0) // Just a placeholder for comparison
  const soon = subDays(expiryDate, daysThreshold)
  return !isAfter(new Date(), expiryDate) && isAfter(new Date(), soon)
}

/**
 * Validates initials match legal name
 */
export function validateInitials(legalName: string, initials: string): boolean {
  if (!legalName || !initials) return false

  const parts = legalName.trim().split(/\s+/)
  const expectedInitials = parts.map(p => p[0].toUpperCase()).join('')
  const normalizedInitials = initials.toUpperCase().replace(/\s/g, '')

  return normalizedInitials === expectedInitials
}
