import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Admin from './Admin'
import { userService } from '~/services/user-service'
import { teamService } from '~/services/team-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createAdminUser, createAdminUserDto, createRoles, createTeam, createUser } from '~/test/fixtures'

vi.mock('~/services/user-service', () => ({
  userService: {
    list: vi.fn(),
    listRoles: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    assignRole: vi.fn(),
    findByEmail: vi.fn(),
  },
}))
vi.mock('~/services/team-service', () => ({
  teamService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
}))
vi.mock('~/services/base-service', () => ({
  baseService: { request: vi.fn() },
}))

describe('Admin page', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(userService.list).mockResolvedValue({
      users: [createAdminUserDto()],
    })
    vi.mocked(userService.listRoles).mockResolvedValue({ roles: createRoles() })
    vi.mocked(teamService.list).mockResolvedValue({ teams: [createTeam()] })
  })

  it('renders users tab for admin with user management header', async () => {
    setAuthUser(createAdminUser())
    renderWithProviders(<Admin />)

    await waitFor(() => {
      expect(screen.getByText('Адміністрування')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Користувачі' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Команди' })).toBeInTheDocument()
    })
  })

  it('shows seed and clear buttons only for super admin', async () => {
    setAuthUser(createAdminUser({ email: 'superadmin@projex.com' }))
    renderWithProviders(<Admin />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Очистити БД/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Заповнити даними/i })).toBeInTheDocument()
    })
  })

  it('hides seed and clear buttons for regular admin', async () => {
    setAuthUser(createAdminUser({ email: 'admin@projex.dev' }))
    renderWithProviders(<Admin />)

    await waitFor(() => {
      expect(screen.getByText('Адміністрування')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /Очистити БД/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Заповнити даними/i })).not.toBeInTheDocument()
  })

  it('shows teams tab only for project manager', async () => {
    setAuthUser(createUser({ role: { id: 2, name: 'Project Manager' } }))
    renderWithProviders(<Admin />)

    await waitFor(() => {
      expect(screen.getByText('Команди')).toBeInTheDocument()
    })
    expect(screen.queryByText('Адміністрування')).not.toBeInTheDocument()
  })

  it('switches between users and teams tabs for admin', async () => {
    const user = userEvent.setup()
    setAuthUser(createAdminUser())
    renderWithProviders(<Admin />)

    await waitFor(() => expect(screen.getByText('Адміністрування')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Команди' }))

    expect(screen.getByText('Керування командами та їх учасниками')).toBeInTheDocument()
  })
})
