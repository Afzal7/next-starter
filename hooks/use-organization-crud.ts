'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { orgClient } from '@/lib/auth-client'
import type { Organization } from 'better-auth/plugins/organization'



/**
 * Hook to fetch all organizations for the current user
 */
export function useUserOrganizations() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['user-organizations', session?.user?.id],
    queryFn: async (): Promise<Organization[]> => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await orgClient.list({
        query: { userId: session.user.id }
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch organizations')
      }

      return data || []
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: async (params: {
      name: string
      slug: string
    }) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await orgClient.create(params)

      if (error) {
        throw new Error(error.message || 'Failed to create organization')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-organizations']
      })
      queryClient.invalidateQueries({
        queryKey: ['organizations']
      })
    }
  })
}

/**
 * Hook to update an organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { organizationId: string; name?: string; slug?: string },
    Error,
    { organizationId: string; name?: string; slug?: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const updateData: { name?: string; slug?: string } = {}
      if (variables.name !== undefined) updateData.name = variables.name
      if (variables.slug !== undefined) updateData.slug = variables.slug

      const { error } = await orgClient.update({
        organizationId: variables.organizationId,
        data: updateData,
      })

      if (error) {
        throw new Error(error.message || 'Failed to update organization')
      }

      return variables
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', variables?.organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['user-organizations']
      })
      queryClient.invalidateQueries({
        queryKey: ['organizations']
      })
    }
  })
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { organizationId: string },
    Error,
    { organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.delete(variables)

      if (error) {
        throw new Error(error.message || 'Failed to delete organization')
      }

      return variables
    },
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({
        queryKey: ['organization-members', variables.organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['user-organizations']
      })
      queryClient.invalidateQueries({
        queryKey: ['organizations']
      })
    }
  })
}

/**
 * Hook to leave an organization
 */
export function useLeaveOrganization() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation<
    { organizationId: string },
    Error,
    { organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await orgClient.leave(variables)

      if (error) {
        throw new Error(error.message || 'Failed to leave organization')
      }

      return variables
    },
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({
        queryKey: ['organization-members', variables.organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['user-organizations']
      })
      queryClient.invalidateQueries({
        queryKey: ['organizations']
      })
    }
  })
}