import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Auth from './Auth'

describe('Auth page', () => {
  it('renders auth layout with nested outlet content', () => {
    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route path="/auth" element={<Auth />}>
            <Route path="login" element={<p>Login child</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login child')).toBeInTheDocument()
  })
})
