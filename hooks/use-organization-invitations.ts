'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { orgClient } from '@/lib/auth-client'
import type { Organization } from 'better-auth/plugins/organization'

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

interface OrganizationWithInvitations extends Organization {
  invitations?: Invitation[];
}

/**
 * Custom hook for fetching organization invitations
 * Uses TanStack Query for caching and automatic refetching
 *
 * @param orgId - The organization ID to fetch invitations for
 * @returns Query result with organization and invitation data
 */
export function useOrganizationInvitations(orgId: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['organization-invitations', orgId],
    queryFn: async (): Promise<OrganizationWithInvitations | null> => {
      if (!session?.user || !orgId) {
        throw new Error('User not authenticated or organization ID missing')
      }

      const { data, error } = await orgClient.getFullOrganization({
        query: { organizationId: orgId }
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch organization invitations')
      }

      return data || null
    },
    enabled: !!session?.user?.id && !!orgId,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute (invitations change frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

/**
 * Custom hook for fetching just the invitations list for an organization
 * More lightweight than fetching full organization data
 *
 * @param orgId - The organization ID to fetch invitations for
 * @returns Query result with invitations array
 */
export function useInvitationsList(orgId: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['invitations-list', orgId],
    queryFn: async (): Promise<Invitation[]> => {
      if (!session?.user || !orgId) {
        throw new Error('User not authenticated or organization ID missing')
      }

      const { data, error } = await orgClient.listInvitations({
        query: { organizationId: orgId }
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch invitations')
      }

      return data || []
    },
    enabled: !!session?.user?.id && !!orgId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation hook for sending member invitations to an organization
 * Includes optimistic updates and cache invalidation
 */
export function useInviteMember() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { email: string; role: 'member' | 'admin' | 'owner'; organizationId: string },
    Error,
    { email: string; role: 'member' | 'admin' | 'owner'; organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.inviteMember(variables)

      if (error) {
        throw new Error(error.message || 'Failed to send invitation')
      }

      return variables
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate both organization invitations and invitations list
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', variables.organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['invitations-list', variables.organizationId]
      })
    }
  })
}

/**
 * Mutation hook for cancelling pending invitations
 * Includes optimistic updates and cache invalidation
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { invitationId: string },
    Error,
    { invitationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.cancelInvitation(variables)

      if (error) {
        throw new Error(error.message || 'Failed to cancel invitation')
      }

      return variables
    },
    onSettled: (_data, _error, _variables) => {
      // Invalidate all invitation queries since we don't know which org this invitation belonged to
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations']
      })
      queryClient.invalidateQueries({
        queryKey: ['invitations-list']
      })
    }
  })
}

/**
 * Mutation hook for resending invitations
 * Updates the invitation's created date optimistically
 */
export function useResendInvitation() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { invitationId: string; email: string; role: 'member' | 'admin' | 'owner'; organizationId: string },
    Error,
    { invitationId: string; email: string; role: 'member' | 'admin' | 'owner'; organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.inviteMember({
        email: variables.email,
        role: variables.role,
        organizationId: variables.organizationId,
        resend: true,
      })

      if (error) {
        throw new Error(error.message || 'Failed to resend invitation')
      }

      return variables
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', variables.organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['invitations-list', variables.organizationId]
      })
    }
  })
}