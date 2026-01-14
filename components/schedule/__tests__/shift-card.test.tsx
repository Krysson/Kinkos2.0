import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShiftCard } from '../shift-card'
import { createClient } from '@/utils/supabase/client'
import * as useShiftsHook from '@/hooks/queries/use-shifts'
import type { Shift } from '@/hooks/queries/use-shifts'

jest.mock('@/utils/supabase/client')
jest.mock('sonner')
jest.mock('@/hooks/queries/use-shifts', () => ({
  ...jest.requireActual('@/hooks/queries/use-shifts'),
  useSignUpForShift: jest.fn(),
  useCancelShiftSignup: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockUseSignUpForShift = useShiftsHook.useSignUpForShift as jest.MockedFunction<
  typeof useShiftsHook.useSignUpForShift
>
const mockUseCancelShiftSignup = useShiftsHook.useCancelShiftSignup as jest.MockedFunction<
  typeof useShiftsHook.useCancelShiftSignup
>

describe('ShiftCard', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    jest.clearAllMocks()

    // Mock the mutation hooks
    mockUseSignUpForShift.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as any)

    mockUseCancelShiftSignup.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as any)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockShift: Shift = {
    id: 'shift-1',
    title: 'Test Shift',
    description: 'Test description',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 90000000).toISOString(),
    capacity: 5,
    location: 'Test Location',
    status: 'open',
    created_at: new Date().toISOString(),
    created_by: 'user-1',
    shift_signups: [],
  }

  it('should render shift details', () => {
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
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<ShiftCard shift={mockShift} />, { wrapper })

    expect(screen.getByText('Test Shift')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
    expect(screen.getByText(/5 spots remaining/)).toBeInTheDocument()
  })

  it('should show "Signed Up" badge when user is signed up', async () => {
    const signedUpShift: Shift = {
      ...mockShift,
      shift_signups: [
        {
          id: 'signup-1',
          member_id: 'member-1',
          cancelled_at: null,
        },
      ],
    }

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
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<ShiftCard shift={signedUpShift} />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Signed Up')).toBeInTheDocument()
    })

    expect(screen.getByText('Cancel Signup')).toBeInTheDocument()
  })

  it('should show "Full" badge when shift is full', () => {
    const fullShift: Shift = {
      ...mockShift,
      capacity: 2,
      shift_signups: [
        { id: '1', member_id: 'm1', cancelled_at: null },
        { id: '2', member_id: 'm2', cancelled_at: null },
      ],
    }

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
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<ShiftCard shift={fullShift} />, { wrapper })

    expect(screen.getByText('Full')).toBeInTheDocument()
    expect(screen.getByText('Shift Full')).toBeDisabled()
  })

  it('should disable sign up button when shift is full', () => {
    const fullShift: Shift = {
      ...mockShift,
      capacity: 1,
      shift_signups: [{ id: '1', member_id: 'm1', cancelled_at: null }],
    }

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
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<ShiftCard shift={fullShift} />, { wrapper })

    const signUpButton = screen.getByText('Shift Full')
    expect(signUpButton).toBeDisabled()
  })

  it('should calculate spots remaining correctly', () => {
    const partialShift: Shift = {
      ...mockShift,
      capacity: 5,
      shift_signups: [
        { id: '1', member_id: 'm1', cancelled_at: null },
        { id: '2', member_id: 'm2', cancelled_at: null },
      ],
    }

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
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<ShiftCard shift={partialShift} />, { wrapper })

    expect(screen.getByText(/3 spots remaining \(2\/5\)/)).toBeInTheDocument()
  })
})
