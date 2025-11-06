import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { guardianService } from '@/app/routes/guardians/services/guardianService';

interface UseGuardianMemberIdReturn {
  memberId: number | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch the guardian's member_id from the backend using Auth0 token.
 * This hook calls the backend endpoint that maps auth0_user_id to member_id.
 * 
 * @returns Object containing memberId, loading state, error, and refetch function
 * 
 * @example
 * const { memberId, isLoading, error } = useGuardianMemberId();
 * 
 * if (isLoading) return <Loader />;
 * if (error) return <Error message={error.message} />;
 * if (!memberId) return <CompleteProfile />;
 * 
 * // Use memberId for API calls
 * const members = useMembersInChargeOf(memberId);
 */
export const useGuardianMemberId = (): UseGuardianMemberIdReturn => {
  const { user, isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const [memberId, setMemberId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemberId = useCallback(async () => {
    // Reset states
    setError(null);

    // Wait for Auth0 to finish loading
    if (auth0Loading) {
      setIsLoading(true);
      return;
    }

    // User not authenticated
    if (!isAuthenticated || !user?.sub) {
      setIsLoading(false);
      setMemberId(undefined);
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the backend to get member_id using auth0_user_id
      const result = await guardianService.getMemberId(user.sub);
      
      if (result?.member_id) {
        setMemberId(result.member_id);
      } else {
        setMemberId(undefined);
      }
    } catch (err) {
      console.error('Error fetching guardian member_id:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch member_id'));
      setMemberId(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [auth0Loading, isAuthenticated, user?.sub]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchMemberId();
  }, [fetchMemberId]);

  return {
    memberId,
    isLoading,
    error,
    refetch: fetchMemberId,
  };
};
