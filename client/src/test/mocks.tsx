import { type ReactNode } from 'react'
import { vi } from 'vitest'
import type { UserDto } from '~/types/auth.types'
import { createUser } from './fixtures'

export interface AuthContextMock {
  accessToken: string | null
  user: UserDto | null
  isAuthenticated: boolean
  signIn: ReturnType<typeof vi.fn>
  signOut: ReturnType<typeof vi.fn>
  refreshUser: ReturnType<typeof vi.fn>
}

export function createAuthMock(user: UserDto | null = createUser()): AuthContextMock {
  return {
    accessToken: user ? 'test-token' : null,
    user,
    isAuthenticated: Boolean(user),
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(undefined),
  }
}

export const authMockState = {
  current: createAuthMock(),
}

vi.mock('~/context/authContext', () => ({
  useAuthContext: () => authMockState.current,
}))

vi.mock('~/components/dashboard-layout/DashboardLayout', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}))

vi.mock('~/components/sidebar/Sidebar', () => ({
  default: () => <nav data-testid="sidebar" />,
}))

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: ReactNode }) => (
    <div data-testid="drag-drop-context">{children}</div>
  ),
  Droppable: ({
    children,
    droppableId,
  }: {
    children: (a: unknown, b: unknown) => ReactNode
    droppableId: string
  }) => (
    <div data-testid={`droppable-${droppableId}`}>
      {children(
        { innerRef: vi.fn(), droppableProps: {} },
        { isDraggingOver: false },
      )}
    </div>
  ),
  Draggable: ({
    children,
    draggableId,
  }: {
    children: (a: unknown, b: unknown) => ReactNode
    draggableId: string
  }) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children(
        { innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} },
        { isDragging: false },
      )}
    </div>
  ),
}))
