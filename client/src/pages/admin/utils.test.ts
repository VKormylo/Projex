import { describe, expect, it } from 'vitest'
import { isSuperAdmin, SUPER_ADMIN_EMAIL } from './utils'

describe('admin utils', () => {
  it('identifies super admin by email', () => {
    expect(SUPER_ADMIN_EMAIL).toBe('superadmin@projex.com')
    expect(isSuperAdmin('superadmin@projex.com')).toBe(true)
    expect(isSuperAdmin('admin@projex.dev')).toBe(false)
    expect(isSuperAdmin(null)).toBe(false)
  })
})
