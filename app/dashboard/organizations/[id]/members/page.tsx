'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { orgClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Users, Crown } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { toast } from 'sonner';
import type { Organization, Member } from 'better-auth/plugins/organization';

interface MemberWithUser extends Member {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}

export default function OrganizationMembersPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  const orgId = params.id as string;

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!session?.user || !orgId) return;

      try {
        setIsLoading(true);
        const { data: orgData, error: orgError } = await orgClient.getFullOrganization();

        if (orgError) {
          setError('Organization not found or access denied');
          return;
        }

        const { members: orgMembers, ...org } = orgData || {};
        setOrganization(org);
        setMembers(orgMembers || []);

        const current = orgMembers?.find(m => m.userId === session.user.id);
        setCurrentMember(current || null);
      } catch {
        setError('Failed to load organization');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [session?.user?.id, session?.user, orgId]);

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!currentMember || currentMember.role !== 'owner' && currentMember.role !== 'admin') {
      return;
    }

    setUpdatingRole(memberId);
    try {
      await orgClient.updateMemberRole({
        memberId,
        role: newRole,
        organizationId: orgId,
      });

      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ));

      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.warning('Failed to update member role. Please try again.');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!currentMember || currentMember.role !== 'owner' && currentMember.role !== 'admin') {
      return;
    }

    setRemovingMember(memberId);
    try {
      await orgClient.removeMember({
        memberIdOrEmail: memberEmail,
        organizationId: orgId,
      });

      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.warning('Failed to remove member. Please try again.');
    } finally {
      setRemovingMember(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={6} />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="space-y-6">
        <ErrorState
          message={error || 'This organization may not exist or you may not have access.'}
          type="page"
          onRetry={() => window.location.reload()}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  const isOwner = currentMember?.role === 'owner';
  const canManageMembers = currentMember && (currentMember.role === 'owner' || currentMember.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold"><span className="capitalize">{organization.name}</span> Members</h1>
          <p className="text-muted-foreground">Manage your organization members</p>
        </div>
        <Badge variant="outline">{members.length} members</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            View and manage organization members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {member.id === currentMember?.id ? (
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      {member.role}
                    </Badge>
                  ) : canManageMembers ? (
                    <>
                      <Label htmlFor={`role-${member.id}`} className="sr-only">
                        Role for {member.user?.name}
                      </Label>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleUpdateRole(member.id, value)}
                        disabled={updatingRole === member.id}
                      >
                        <SelectTrigger className="w-28" id={`role-${member.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={removingMember === member.id}>
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.user?.name || member.user?.email} from this organization? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id, member.user?.email || '')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Badge variant="secondary">{member.role}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}