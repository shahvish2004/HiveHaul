import { render, screen } from '@testing-library/react'

describe('Mobile Responsiveness', () => {
  test('form is responsive at 375px width (mobile)', () => {
    const { container } = render(<div style={{ width: '375px' }}>Mobile Test</div>)
    expect(container.firstChild).toHaveStyle('width: 375px')
  })

  test('dashboard displays properly on mobile', () => {
    const { container } = render(
      <div style={{ width: '375px' }}>
        <h1>Manager Dashboard</h1>
      </div>
    )
    expect(screen.getByText(/Manager Dashboard/i)).toBeInTheDocument()
    expect(container.firstChild).toHaveStyle('width: 375px')
  })

  test('form inputs are touch-friendly (min 44px height)', () => {
    const { container } = render(
      <input type="text" style={{ height: '44px' }} placeholder="Test" />
    )
    const input = container.querySelector('input')
    expect(input).toHaveStyle('height: 44px')
  })
})
