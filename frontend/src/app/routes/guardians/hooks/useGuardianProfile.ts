import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { isAxiosError } from 'axios';
import { guardianService } from '@/app/routes/guardians/services/guardianService';
import { useGuardianMemberId } from './useGuardianMemberId';
import type { Guardian } from '@/types/guardian.type';

export const useGuardianProfile = () => {
  const { isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const { memberId, isLoading: memberIdLoading } = useGuardianMemberId();
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsToCompleteProfile, setNeedsToCompleteProfile] = useState(false);

  const loadGuardian = useCallback(async () => {
    if (auth0Loading || memberIdLoading || !isAuthenticated) {
      setIsLoading(true);
      return;
    }

    if (!memberId) {
      setIsLoading(false);
      setNeedsToCompleteProfile(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await guardianService.getGuardianById(memberId);
      
      if (response) {
        setGuardian(response);
        setNeedsToCompleteProfile(false);
      } else {
        setGuardian(null);
        setNeedsToCompleteProfile(true);
      }
    } catch (error) {
      console.error('Error loading guardian:', error);

      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          setGuardian(null);
          setNeedsToCompleteProfile(true);
        }
      } else {
        setGuardian(null);
        setNeedsToCompleteProfile(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [memberId, memberIdLoading, auth0Loading, isAuthenticated]);

  useEffect(() => {
    loadGuardian();
  }, [loadGuardian]);

  return {
    guardian,
    isLoading: isLoading || auth0Loading,
    needsToCompleteProfile,
    reloadGuardian: loadGuardian,
  };
};