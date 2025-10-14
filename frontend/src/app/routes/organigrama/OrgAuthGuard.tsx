import React from 'react';
import FullScreenLoader from '@/components/common/FullScreenLoader';
import { useRoleContext } from '@/hooks/useRoleContext';

const OrgAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useRoleContext();

  if (status === 'idle' || status === 'loading') return <FullScreenLoader />;

  return <>{children}</>;
};

export default OrgAuthGuard;
