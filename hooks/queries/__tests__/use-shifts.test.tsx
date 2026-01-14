import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useShifts, useSignUpForShift, useCancelShiftSignup } from '../use-shifts'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/utils/supabase/client')
jest.mock('sonner')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('useShifts', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should fetch all shifts', async () => {
    const mockShifts = [
      {
        id: '1',
        title: 'Test Shift',
        description: 'Test description',
        start_time: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        end_time: new Date(Date.now() + 90000000).toISOString(),
        capacity: 5,
        location: 'Test Location',
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: 'user-1',
        shift_signups: [],
      },
    ]

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'member-1' },
          error: null,
        }),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockShifts,
          error: null,
        }),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useShifts('all'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockShifts)
  })

  it('should filter my shifts', async () => {
    const mockShifts = [
      {
        id: '1',
        title: 'My Shift',
        description: 'Test',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        capacity: 5,
        location: 'Test',
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: 'user-1',
        shift_signups: [
          {
            id: 'signup-1',
            member_id: 'member-1',
            cancelled_at: null,
          },
        ],
      },
      {
        id: '2',
        title: 'Other Shift',
        description: 'Test',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        capacity: 5,
        location: 'Test',
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: 'user-1',
        shift_signups: [],
      },
    ]

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'member-1' },
          error: null,
        }),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockShifts,
          error: null,
        }),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useShifts('my-shifts'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe('1')
  })

  it('should filter available shifts', async () => {
    const mockShifts = [
      {
        id: '1',
        title: 'Available Shift',
        description: 'Test',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        capacity: 5,
        location: 'Test',
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: 'user-1',
        shift_signups: [{ id: '1', member_id: 'm1', cancelled_at: null }],
      },
      {
        id: '2',
        title: 'Full Shift',
        description: 'Test',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        capacity: 2,
        location: 'Test',
        status: 'open',
        created_at: new Date().toISOString(),
        created_by: 'user-1',
        shift_signups: [
          { id: '1', member_id: 'm1', cancelled_at: null },
          { id: '2', member_id: 'm2', cancelled_at: null },
        ],
      },
    ]

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'member-1' },
          error: null,
        }),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockShifts,
          error: null,
        }),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useShifts('available'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe('1')
  })
})

describe('useSignUpForShift', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should sign up for a shift successfully', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'members') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'member-1' },
              error: null,
            }),
          }
        }
        if (table === 'shifts') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'shift-1',
                capacity: 5,
                shift_signups: [],
              },
              error: null,
            }),
          }
        }
        if (table === 'shift_signups') {
          const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'new-signup', shift_id: 'shift-1', member_id: 'member-1' },
                  error: null,
                }),
              })),
            })),
          }
          return mockChain
        }
      }),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useSignUpForShift(), { wrapper })

    result.current.mutate('shift-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith('Successfully signed up for shift!')
  })

  it('should handle error when shift is full', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'members') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'member-1' },
              error: null,
            }),
          }
        }
        if (table === 'shifts') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'shift-1',
                capacity: 2,
                shift_signups: [
                  { id: '1', cancelled_at: null },
                  { id: '2', cancelled_at: null },
                ],
              },
              error: null,
            }),
          }
        }
      }),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useSignUpForShift(), { wrapper })

    result.current.mutate('shift-1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('This shift is full')
  })
})

describe('useCancelShiftSignup', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should cancel shift signup successfully', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'members') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'member-1' },
              error: null,
            }),
          }
        }
        if (table === 'shift_signups') {
          const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'signup-1' },
              error: null,
            }),
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'signup-1', cancelled_at: new Date().toISOString() },
                    error: null,
                  }),
                })),
              })),
            })),
          }
          return mockChain
        }
      }),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useCancelShiftSignup(), { wrapper })

    result.current.mutate('shift-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith('Successfully cancelled shift signup')
  })
})
