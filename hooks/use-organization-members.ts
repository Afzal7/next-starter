'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { orgClient } from '@/lib/auth-client'
import type { Organization, Member } from 'better-auth/plugins/organization'

interface MemberWithUser extends Member {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}

interface OrganizationWithMembers extends Organization {
  members?: MemberWithUser[];
}

/**
 * Custom hook for fetching organization data with full member details
 * Uses TanStack Query for caching and automatic refetching
 *
 * @param orgId - The organization ID to fetch
 * @returns Query result with organization and member data
 */
export function useOrganizationMembers(orgId: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['organization-members', orgId],
    queryFn: async (): Promise<OrganizationWithMembers | null> => {
      if (!session?.user || !orgId) {
        throw new Error('User not authenticated or organization ID missing')
      }

      const { data, error } = await orgClient.getFullOrganization({
        query: { organizationId: orgId }
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch organization members')
      }

      return data || null
    },
    enabled: !!session?.user?.id && !!orgId,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes (more dynamic data)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

/**
 * Mutation hook for updating a member's role in an organization
 * Includes cache invalidation
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { memberId: string; role: 'member' | 'admin' | 'owner'; organizationId: string },
    Error,
    { memberId: string; role: 'member' | 'admin' | 'owner'; organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.updateMemberRole(variables)

      if (error) {
        throw new Error(error.message || 'Failed to update member role')
      }

      return variables
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', variables?.organizationId]
      })
    }
  })
}

/**
 * Mutation hook for removing a member from an organization
 * Includes cache invalidation
 */
export function useRemoveMember() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { memberIdOrEmail: string; organizationId: string },
    Error,
    { memberIdOrEmail: string; organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.removeMember(variables)

      if (error) {
        throw new Error(error.message || 'Failed to remove member')
      }

      return variables
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', variables?.organizationId]
      })
    }
  })
}