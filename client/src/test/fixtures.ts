import type { UserDto } from '~/types/auth.types'
import type { AdminUserDto, ProjectDto, RoleDto, TeamDto } from '~/types/project.types'
import type { SprintDto, TaskDto } from '~/types/sprint.types'

export function createUser(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: '1',
    fullName: 'Test User',
    email: 'test@projex.dev',
    position: 'Developer',
    isActive: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    role: { id: 3, name: 'Developer' },
    ...overrides,
  }
}

export function createAdminUser(overrides: Partial<UserDto> = {}): UserDto {
  return createUser({
    id: '99',
    fullName: 'Super Admin',
    email: 'superadmin@projex.com',
    position: 'Administrator',
    role: { id: 1, name: 'Admin' },
    ...overrides,
  })
}

export function createProject(overrides: Partial<ProjectDto> = {}): ProjectDto {
  return {
    id: 'p1',
    teamId: 't1',
    name: 'Projex Platform',
    description: 'Main project',
    startDate: '2026-01-01',
    endDate: null,
    status: 'active',
    createdBy: '1',
    tasks: [{ id: 'task1' }],
    sprints: [{ id: 's1' }],
    ...overrides,
  }
}

export function createTask(overrides: Partial<TaskDto> = {}): TaskDto {
  return {
    id: 'task1',
    projectId: 'p1',
    sprintId: 's1',
    title: 'Implement login page',
    description: 'Auth flow',
    priority: 'high',
    status: 'in_progress',
    storyPoint: 5,
    assigneeId: '1',
    reporterId: '2',
    dueDate: '2026-12-31',
    createdAt: '2026-02-01T10:00:00.000Z',
    assignee: { id: '1', fullName: 'Test User' },
    reporter: { id: '2', fullName: 'Reporter' },
    project: { id: 'p1', name: 'Projex Platform' },
    sprint: { id: 's1', name: 'Sprint 1' },
    ...overrides,
  }
}

export function createSprint(overrides: Partial<SprintDto> = {}): SprintDto {
  return {
    id: 's1',
    projectId: 'p1',
    name: 'Sprint 1',
    goal: 'MVP',
    startDate: '2026-02-01',
    endDate: '2026-02-14',
    status: 'active',
    tasks: [],
    ...overrides,
  }
}

export function createTeam(overrides: Partial<TeamDto> = {}): TeamDto {
  return {
    id: 't1',
    name: 'Team Alpha',
    teamMember: [
      {
        teamId: 't1',
        userId: '1',
        user: {
          id: '1',
          fullName: 'Test User',
          email: 'test@projex.dev',
          position: 'Developer',
          isActive: true,
          role: { id: 3, name: 'Developer' },
        },
      },
    ],
    ...overrides,
  }
}

export function createAdminUserDto(overrides: Partial<AdminUserDto> = {}): AdminUserDto {
  return {
    id: '1',
    fullName: 'Test User',
    email: 'test@projex.dev',
    position: 'Developer',
    isActive: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    role: { id: 3, name: 'Developer' },
    _count: { assigned: 2 },
    ...overrides,
  }
}

export function createRoles(): RoleDto[] {
  return [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'Developer' },
  ]
}
