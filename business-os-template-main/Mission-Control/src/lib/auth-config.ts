// Whitelisted emails — configure via ALLOWED_EMAILS env var (comma-separated)
const envEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) ?? []

export const ALLOWED_EMAILS = envEmails as readonly string[]

export type UserRole = 'owner' | 'member'

// Role assignments — first email in list gets 'owner' role
export const EMAIL_ROLES: Record<string, UserRole> = Object.fromEntries(
  envEmails.map((email, i) => [email.toLowerCase(), i === 0 ? 'owner' : 'member'])
)

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase())
}

export function getRoleForEmail(email: string): UserRole {
  return EMAIL_ROLES[email.toLowerCase()] ?? 'member'
}
