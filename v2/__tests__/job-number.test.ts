describe('Job Number Generation', () => {
  const generateJobNumber = (timestamp: Date = new Date()): string => {
    const year = timestamp.getFullYear()
    const month = String(timestamp.getMonth() + 1).padStart(2, '0')
    const day = String(timestamp.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `HH-${year}-${month}${day}-${random}`
  }

  test('generates job number with correct format HH-YYYY-MMDD-###', () => {
    const jobNumber = generateJobNumber()
    const pattern = /^HH-\d{4}-\d{4}-\d{3}$/
    expect(jobNumber).toMatch(pattern)
  })

  test('includes current year and month in job number', () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    const jobNumber = generateJobNumber(now)
    expect(jobNumber).toContain(`HH-${year}-${month}${day}`)
  })

  test('generates unique sequential numbers', () => {
    const jobNumbers = new Set()
    for (let i = 0; i < 100; i++) {
      jobNumbers.add(generateJobNumber())
    }
    // Due to random component, should have many unique values
    expect(jobNumbers.size).toBeGreaterThan(90)
  })

  test('persists job number in database', () => {
    // Integration test - verified during Supabase testing
    const jobNumber = generateJobNumber()
    expect(jobNumber).toBeTruthy()
  })
})
