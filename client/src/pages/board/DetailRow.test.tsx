import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DetailRow from './DetailRow'

describe('DetailRow component', () => {
  it('renders label and children content', () => {
    render(
      <DetailRow icon={<span data-testid="icon" />} label="Виконавець">
        <span>John Doe</span>
      </DetailRow>,
    )

    expect(screen.getByText('Виконавець')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
