import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Projects from './Projects'
import { projectService } from '~/services/project-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createProject, createUser } from '~/test/fixtures'

vi.mock('~/services/project-service', () => ({
  projectService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedList = vi.mocked(projectService.list)

describe('Projects page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAuthUser(createUser({ role: { id: 2, name: 'Project Manager' } }))
    mockedList.mockResolvedValue({ projects: [createProject()] })
  })

  it('renders page header and project list', async () => {
    renderWithProviders(<Projects />)

    expect(screen.getByText('Проєкти')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Projex Platform')).toBeInTheDocument()
    })
  })

  it('shows create project button for non-developer roles', async () => {
    renderWithProviders(<Projects />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Створити проєкт/i })).toBeInTheDocument()
    })
  })

  it('hides create project button for developers', async () => {
    setAuthUser(createUser({ role: { id: 3, name: 'Developer' } }))
    renderWithProviders(<Projects />)

    await waitFor(() => {
      expect(screen.getByText('Projex Platform')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /Створити проєкт/i })).not.toBeInTheDocument()
  })

  it('filters projects by search query', async () => {
    const user = userEvent.setup()
    mockedList.mockResolvedValue({
      projects: [
        createProject({ id: 'p1', name: 'Alpha App' }),
        createProject({ id: 'p2', name: 'Beta Portal' }),
      ],
    })

    renderWithProviders(<Projects />)
    await waitFor(() => expect(screen.getByText('Alpha App')).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText('Пошук проєктів...'), 'Beta')

    expect(screen.queryByText('Alpha App')).not.toBeInTheDocument()
    expect(screen.getByText('Beta Portal')).toBeInTheDocument()
  })
})
