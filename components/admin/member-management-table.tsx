'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MemberRoleSelect } from '@/components/admin/member-role-select'
import { MemberStatusBadge } from '@/components/admin/member-status-badge'
import { MemberDetailsDialog } from '@/components/admin/member-details-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { Search, Filter, X, MoreHorizontal, Eye, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Member, MemberRole, MemberStatus } from '@/lib/types'

interface MemberManagementTableProps {
  initialMembers: Member[]
}

const ITEMS_PER_PAGE = 20

export function MemberManagementTable({ initialMembers }: MemberManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter logic
  const filteredMembers = useMemo(() => {
    return initialMembers.filter(member => {
      const matchesSearch =
        member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.legal_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === 'all' || member.role === roleFilter
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [initialMembers, searchQuery, roleFilter, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE)
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member)
    setDialogOpen(true)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name or email...'
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className='pl-10'
          />
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Select
            value={roleFilter}
            onValueChange={value => {
              setRoleFilter(value as MemberRole | 'all')
              setCurrentPage(1)
            }}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='All Roles' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='owner'>Owner</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
              <SelectItem value='lead'>Lead</SelectItem>
              <SelectItem value='volunteer'>Volunteer</SelectItem>
              <SelectItem value='member'>Member</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={value => {
              setStatusFilter(value as MemberStatus | 'all')
              setCurrentPage(1)
            }}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='suspended'>Suspended</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-10'>
              <X className='h-4 w-4 mr-2' />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='hidden md:table-cell'>Member Since</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map(member => (
                <TableRow key={member.id}>
                  <TableCell className='font-medium'>
                    <div>
                      {member.display_name}
                      {member.legal_name && (
                        <div className='text-xs text-muted-foreground font-normal'>
                          {member.legal_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <MemberRoleSelect
                      memberId={member.id}
                      currentRole={member.role}
                    />
                  </TableCell>
                  <TableCell>
                    <MemberStatusBadge status={member.status} />
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-sm'>
                    {member.member_since ? format(new Date(member.member_since), 'PP') : 'Not set'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                          <UserCog className='mr-2 h-4 w-4' />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive'>
                          Suspend Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='h-24 text-center'>
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-end space-x-2 py-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}>
            Previous
          </Button>
          <div className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}

      {selectedMember && (
        <MemberDetailsDialog
          member={selectedMember}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  )
}
