import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sprints from './Sprints'
import { projectService } from '~/services/project-service'
import { sprintService } from '~/services/sprint-service'
import { taskService } from '~/services/task-service'
import { teamService } from '~/services/team-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createProject, createSprint, createTask, createTeam, createUser } from '~/test/fixtures'

vi.mock('~/services/project-service', () => ({ projectService: { list: vi.fn() } }))
vi.mock('~/services/sprint-service', () => ({
  sprintService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), close: vi.fn(), delete: vi.fn() },
}))
vi.mock('~/services/task-service', () => ({
  taskService: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
}))
vi.mock('~/services/team-service', () => ({ teamService: { list: vi.fn() } }))

describe('Sprints page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAuthUser(createUser({ role: { id: 2, name: 'Project Manager' } }))

    vi.mocked(projectService.list).mockResolvedValue({
      projects: [createProject()],
    })
    vi.mocked(sprintService.list).mockResolvedValue({
      sprints: [createSprint()],
    })
    vi.mocked(taskService.list).mockResolvedValue({
      tasks: [
        createTask({ sprintId: null, title: 'Backlog task' }),
        createTask({ id: 't2', sprintId: 's1', title: 'Sprint task' }),
      ],
    })
    vi.mocked(teamService.list).mockResolvedValue({ teams: [createTeam()] })
  })

  it('renders sprint planning header and backlog', async () => {
    renderWithProviders(<Sprints />)

    expect(screen.getByText('Планування спринтів')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/Беклог/)).toBeInTheDocument()
      expect(screen.getByText('Backlog task')).toBeInTheDocument()
    })
  })

  it('shows create sprint button for project managers', async () => {
    renderWithProviders(<Sprints />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Створити спринт/i })).toBeInTheDocument()
    })
  })

  it('switches to all sprints tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sprints />)

    await waitFor(() => expect(screen.getByText('Backlog task')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Всі спринти' }))

    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
  })
})
