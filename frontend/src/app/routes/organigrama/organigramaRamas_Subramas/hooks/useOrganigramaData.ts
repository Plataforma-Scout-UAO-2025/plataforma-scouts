import { useCallback, useEffect, useRef, useState } from 'react';
import type { Branch as Rama } from '../types/frontend';
import * as organigramaService from '../services';
import { useApiError } from '../hooks/useApiError';

export function useOrganigramaData(tenantSlug?: string, groupSlug?: string) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');

  const isLoadingRamasRef = useRef(false);
  const isLoadingYearsRef = useRef(false);

  const { handleError } = useApiError();

  const loadAvailableYears = useCallback(async () => {
    if (!tenantSlug || !groupSlug || isLoadingYearsRef.current) return;
    try {
      isLoadingYearsRef.current = true;
      const years = await organigramaService.getAvailableYears(tenantSlug, groupSlug);
      setAvailableYears(years);
      if (!selectedYear && years.length > 0) setSelectedYear(years[0].toString());
    } catch (err) {
      handleError(err);
      setAvailableYears([new Date().getFullYear()]);
    } finally {
      isLoadingYearsRef.current = false;
    }
  }, [tenantSlug, groupSlug, handleError, selectedYear]);

  const loadRamas = useCallback(async () => {
    if (!tenantSlug || !groupSlug || isLoadingRamasRef.current) return;
    try {
      isLoadingRamasRef.current = true;
      setIsLoading(true);
      const yearFilter = selectedYear ? parseInt(selectedYear) : undefined;
  
  const data = await organigramaService.getRamasWithSubramas(tenantSlug, groupSlug, yearFilter);
      setRamas(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      isLoadingRamasRef.current = false;
    }
  }, [tenantSlug, groupSlug, selectedYear, handleError]);

  useEffect(() => {
    if (tenantSlug && groupSlug) loadAvailableYears();
  }, [tenantSlug, groupSlug, loadAvailableYears]);

  useEffect(() => {
    if (tenantSlug && groupSlug) loadRamas();
  }, [tenantSlug, groupSlug, selectedYear, loadRamas]);

  return {
    ramas,
    isLoading,
    availableYears,
    selectedYear,
    setSelectedYear,
    loadRamas,
  };
}

export default useOrganigramaData;
