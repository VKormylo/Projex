import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyTasks from './MyTasks'
import { taskService } from '~/services/task-service'
import { renderWithProviders, setAuthUser } from '~/test/test-utils'
import { createTask, createUser } from '~/test/fixtures'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('~/services/task-service', () => ({
  taskService: { list: vi.fn() },
}))

const mockedList = vi.mocked(taskService.list)

describe('MyTasks page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAuthUser(createUser({ id: '1' }))
    mockedList.mockResolvedValue({
      tasks: [
        createTask({ id: 't1', title: 'My active task', assigneeId: '1' }),
        createTask({
          id: 't2',
          title: 'Overdue task',
          assigneeId: '1',
          dueDate: '2020-01-01',
          status: 'todo',
        }),
      ],
    })
  })

  it('renders page header and assigned tasks', async () => {
    renderWithProviders(<MyTasks />)

    expect(screen.getByText('Мої задачі')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('My active task')).toBeInTheDocument()
    })
  })

  it('switches to overdue tab and shows overdue tasks only', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MyTasks />)

    await waitFor(() => expect(screen.getByText('My active task')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Прострочені/ }))

    expect(screen.getByText('Overdue task')).toBeInTheDocument()
    expect(screen.queryByText('My active task')).not.toBeInTheDocument()
  })

  it('navigates to task detail on row click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MyTasks />)

    await waitFor(() => expect(screen.getByText('My active task')).toBeInTheDocument())
    await user.click(screen.getByText('My active task'))

    expect(navigateMock).toHaveBeenCalledWith('/board/t1')
  })
})
