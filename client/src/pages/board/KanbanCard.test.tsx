import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import KanbanCard from './KanbanCard'
import { createTask } from '~/test/fixtures'

const onClick = vi.fn()

describe('KanbanCard component', () => {
  it('renders task code, title and assignee initials', () => {
    render(
      <KanbanCard
        task={createTask({
          title: 'Fix navigation bug',
          assignee: { id: '1', fullName: 'Іван Коваленко' },
        })}
        index={0}
        onClick={onClick}
      />,
    )

    expect(screen.getByText('Fix navigation bug')).toBeInTheDocument()
    expect(screen.getByTitle('Іван Коваленко')).toHaveTextContent('ІК')
  })

  it('calls onClick when card is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(
      <KanbanCard task={createTask({ title: 'Clickable task' })} index={0} onClick={onClick} />,
    )

    await user.click(screen.getByText('Clickable task'))
    expect(onClick).toHaveBeenCalled()
  })
})
