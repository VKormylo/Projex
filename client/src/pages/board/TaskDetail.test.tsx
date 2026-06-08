import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import TaskDetail from './TaskDetail'
import { taskService } from '~/services/task-service'
import { commentService } from '~/services/comment-service'
import { projectService } from '~/services/project-service'
import { teamService } from '~/services/team-service'
import { sprintService } from '~/services/sprint-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createProject, createSprint, createTask, createTeam, createUser } from '~/test/fixtures'

vi.mock('~/services/task-service', () => ({
  taskService: {
    get: vi.fn(),
    getHistory: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}))
vi.mock('~/services/comment-service', () => ({
  commentService: { listByTask: vi.fn(), create: vi.fn() },
}))
vi.mock('~/services/project-service', () => ({ projectService: { list: vi.fn() } }))
vi.mock('~/services/team-service', () => ({ teamService: { list: vi.fn() } }))
vi.mock('~/services/sprint-service', () => ({ sprintService: { list: vi.fn() } }))

describe('TaskDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAuthUser(createUser())

    const task = createTask({
      id: 'task1',
      title: 'Implement board drag and drop',
      description: 'Use hello-pangea/dnd',
    })

    vi.mocked(taskService.get).mockResolvedValue({ task })
    vi.mocked(taskService.getHistory).mockResolvedValue({
      history: [
        {
          id: 'h1',
          taskId: 'task1',
          changedBy: '1',
          oldStatus: 'todo',
          newStatus: 'in_progress',
          changedAt: '2026-02-10T10:00:00.000Z',
          user: { id: '1', fullName: 'Test User' },
        },
      ],
    })
    vi.mocked(commentService.listByTask).mockResolvedValue({
      comments: [
        {
          id: 'c1',
          taskId: 'task1',
          authorId: '1',
          body: 'Looks good',
          createdAt: '2026-02-10T11:00:00.000Z',
          author: { id: '1', fullName: 'Test User' },
        },
      ],
    })
    vi.mocked(projectService.list).mockResolvedValue({ projects: [createProject()] })
    vi.mocked(teamService.list).mockResolvedValue({ teams: [createTeam()] })
    vi.mocked(sprintService.list).mockResolvedValue({ sprints: [createSprint()] })
  })

  it('renders task details, comments and history', async () => {
    renderWithProviders(<TaskDetail />, { route: '/board/task1', path: '/board/:taskId' })

    await waitFor(() => {
      expect(screen.getByText('Implement board drag and drop')).toBeInTheDocument()
      expect(screen.getByText('Use hello-pangea/dnd')).toBeInTheDocument()
      expect(screen.getByText('Looks good')).toBeInTheDocument()
      expect(screen.getByText('Історія змін')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    vi.mocked(taskService.get).mockImplementation(() => new Promise(() => {}))
    renderWithProviders(<TaskDetail />, { route: '/board/task1', path: '/board/:taskId' })

    expect(screen.getByText('Завантаження…')).toBeInTheDocument()
  })

  it('shows not found message when task is missing', async () => {
    vi.mocked(taskService.get).mockResolvedValue({ task: null as never })
    renderWithProviders(<TaskDetail />, { route: '/board/missing', path: '/board/:taskId' })

    await waitFor(() => {
      expect(screen.getByText('Задачу не знайдено')).toBeInTheDocument()
    })
  })
})
