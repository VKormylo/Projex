import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import Board from './Board'
import { projectService } from '~/services/project-service'
import { sprintService } from '~/services/sprint-service'
import { taskService } from '~/services/task-service'
import { teamService } from '~/services/team-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createProject, createSprint, createTask, createTeam, createUser } from '~/test/fixtures'

vi.mock('~/services/project-service', () => ({ projectService: { list: vi.fn() } }))
vi.mock('~/services/sprint-service', () => ({ sprintService: { list: vi.fn() } }))
vi.mock('~/services/task-service', () => ({
  taskService: { list: vi.fn(), create: vi.fn(), updateStatus: vi.fn() },
}))
vi.mock('~/services/team-service', () => ({ teamService: { list: vi.fn() } }))

describe('Board page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAuthUser(createUser())

    vi.mocked(projectService.list).mockResolvedValue({
      projects: [createProject({ id: 'p1', name: 'Projex Platform', status: 'active' })],
    })
    vi.mocked(sprintService.list).mockResolvedValue({
      sprints: [createSprint({ id: 's1', projectId: 'p1', status: 'active' })],
    })
    vi.mocked(taskService.list).mockResolvedValue({
      tasks: [createTask({ id: 't1', title: 'Board task', status: 'todo' })],
    })
    vi.mocked(teamService.list).mockResolvedValue({ teams: [createTeam()] })
  })

  it('renders kanban board header and columns', async () => {
    renderWithProviders(<Board />)

    expect(screen.getByText('Дошка задач')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  it('renders tasks in columns after data loads', async () => {
    renderWithProviders(<Board />)

    await waitFor(() => {
      expect(screen.getByText('Board task')).toBeInTheDocument()
    })
  })

  it('shows empty state when project has no active sprints', async () => {
    vi.mocked(sprintService.list).mockResolvedValue({
      sprints: [createSprint({ status: 'closed' })],
    })

    renderWithProviders(<Board />)

    await waitFor(() => {
      expect(screen.getByText(/немає активних спринтів/i)).toBeInTheDocument()
    })
  })
})
