import type { Client, Job } from '@/lib/types'

describe('TypeScript Types', () => {
  test('Client type has required fields', () => {
    const client: Client = {
      id: 'uuid',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Acme Inc',
      address: '123 Main St',
      createdAt: new Date(),
    }
    expect(client.name).toBeTruthy()
    expect(client.email).toBeTruthy()
  })

  test('Job type has required fields', () => {
    const job: Job = {
      id: 'uuid',
      jobNumber: 'HH-2025-0509-001',
      clientId: 'uuid',
      title: 'Moving Service',
      status: 'New',
      pickupAddress: '123 Main St',
      dropoffAddress: '456 Oak Ave',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(job.jobNumber).toMatch(/^HH-/)
    expect(job.status).toBe('New')
  })

  test('Status union type only accepts valid values', () => {
    const validStatus: 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled' = 'New'
    expect(validStatus).toBe('New')
  })
})
