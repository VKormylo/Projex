import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import Profile from './Profile'
import { projectService } from '~/services/project-service'
import { taskService } from '~/services/task-service'
import { teamService } from '~/services/team-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createProject, createTask, createTeam, createUser } from '~/test/fixtures'

vi.mock('~/services/project-service', () => ({
  projectService: { list: vi.fn() },
}))
vi.mock('~/services/task-service', () => ({
  taskService: { list: vi.fn() },
}))
vi.mock('~/services/team-service', () => ({
  teamService: { list: vi.fn() },
}))
vi.mock('~/services/auth-service', () => ({
  authService: { updateMe: vi.fn() },
}))

describe('Profile page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const user = createUser({ id: '1', fullName: 'Іван Коваленко' })
    setAuthUser(user)

    vi.mocked(projectService.list).mockResolvedValue({
      projects: [createProject({ createdBy: '1' })],
    })
    vi.mocked(taskService.list).mockResolvedValue({
      tasks: [
        createTask({ reporterId: '1', assigneeId: '1', status: 'done' }),
        createTask({ id: 'task2', reporterId: '2', assigneeId: '1', status: 'todo' }),
      ],
    })
    vi.mocked(teamService.list).mockResolvedValue({
      teams: [createTeam()],
    })
  })

  it('renders user profile information', async () => {
    renderWithProviders(<Profile />)

    expect(screen.getByText('Профіль користувача')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByText('Іван Коваленко').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Developer').length).toBeGreaterThan(0)
    })
  })

  it('displays computed statistics', async () => {
    renderWithProviders(<Profile />)

    await waitFor(() => {
      expect(screen.getByText('Створено задач')).toBeInTheDocument()
      expect(screen.getByText('Завершено задач')).toBeInTheDocument()
      expect(screen.getByText('Проєктів керую')).toBeInTheDocument()
    })
  })

  it('returns null when user is not available', () => {
    setAuthUser(null)
    const { container } = renderWithProviders(<Profile />)
    expect(container).toBeEmptyDOMElement()
  })
})
