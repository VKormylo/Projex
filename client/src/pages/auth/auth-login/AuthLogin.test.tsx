import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthLogin from './AuthLogin'
import { authService } from '~/services/auth-service'
import { renderWithProviders, getAuthMock } from '~/test/test-utils'

vi.mock('~/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
  },
}))

const mockedLogin = vi.mocked(authService.login)

describe('AuthLogin page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form fields and submit button', () => {
    renderWithProviders(<AuthLogin />)

    expect(screen.getByText('Вхід в систему')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Зареєструватися' })).toHaveAttribute('href', '/auth/signup')
  })

  it('submits credentials and signs in on success', async () => {
    const user = userEvent.setup()
    mockedLogin.mockResolvedValue({ token: 'jwt', userId: '1' })

    renderWithProviders(<AuthLogin />)

    await user.type(screen.getByLabelText('Email'), 'user@projex.dev')
    await user.type(screen.getByLabelText('Пароль'), 'Password123')
    await user.click(screen.getByRole('button', { name: 'Увійти' }))

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: 'user@projex.dev',
        password: 'Password123',
      })
      expect(getAuthMock().signIn).toHaveBeenCalledWith('jwt', '1', true)
    })
  })
})
