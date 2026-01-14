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
import { MemberRoleSelect } from '@/components/admin/member-role-select'
import { MemberStatusBadge } from '@/components/admin/member-status-badge'
import { format } from 'date-fns'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Member, MemberRole, MemberStatus } from '@/lib/types'

interface StaffManagementTableProps {
  initialStaff: Member[]
}

const ITEMS_PER_PAGE = 20

export function StaffManagementTable({ initialStaff }: StaffManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter logic
  const filteredStaff = useMemo(() => {
    return initialStaff.filter(member => {
      const matchesSearch =
        member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.legal_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === 'all' || member.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [initialStaff, searchQuery, roleFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE)
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setCurrentPage(1)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search staff by name or email...'
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
            </SelectContent>
          </Select>

          {(searchQuery || roleFilter !== 'all') && (
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
              <TableHead className='text-right'>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStaff.length > 0 ? (
              paginatedStaff.map(member => (
                <TableRow key={member.id}>
                  <TableCell className='font-medium'>
                    <div>{member.display_name}</div>
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
                  <TableCell className='text-right text-muted-foreground text-sm'>
                    {format(new Date(member.created_at), 'PP')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='h-24 text-center'>
                  No staff members found.
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
    </div>
  )
}
