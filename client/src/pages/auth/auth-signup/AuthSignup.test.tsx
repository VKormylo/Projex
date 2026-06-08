import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthSignup from './AuthSignup'
import { authService } from '~/services/auth-service'
import { renderWithProviders, getAuthMock } from '~/test/test-utils'

vi.mock('~/services/auth-service', () => ({
  authService: {
    signup: vi.fn(),
  },
}))

const mockedSignup = vi.mocked(authService.signup)

describe('AuthSignup page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form with role selection', () => {
    renderWithProviders(<AuthSignup />)

    expect(screen.getByText('Реєстрація')).toBeInTheDocument()
    expect(screen.getByLabelText("Повне ім'я")).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Зареєструватися' })).toBeInTheDocument()
  })

  it('submits signup data and signs in on success', async () => {
    const user = userEvent.setup()
    mockedSignup.mockResolvedValue({ token: 'jwt', userId: '2' })

    renderWithProviders(<AuthSignup />)

    await user.type(screen.getByLabelText("Повне ім'я"), 'New User')
    await user.type(screen.getByLabelText('Email'), 'new@projex.dev')
    await user.type(screen.getByLabelText('Пароль'), 'Password123')
    await user.type(screen.getByLabelText('Підтвердити пароль'), 'Password123')
    await user.click(screen.getByRole('button', { name: 'Зареєструватися' }))

    await waitFor(() => {
      expect(mockedSignup).toHaveBeenCalled()
      expect(getAuthMock().signIn).toHaveBeenCalledWith('jwt', '2', false)
    })
  })
})
