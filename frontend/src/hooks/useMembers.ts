import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMembers,
  fetchMemberById,
  createMember,
  updateMember,
  deleteMember,
  fetchMemberStats,
  clearNotification,
  clearSelected,
  setSelectedMember
} from '../store/membersSlice';
import type { Member, MemberFilters } from '../app/routes/adminGrupal/Miembros/types/member.type';

export const useMembers = () => {
  const dispatch = useAppDispatch();
  const {
    items: members,
    selectedItem: selectedMember,
    loading,
    error,
    message,
    stats
  } = useAppSelector((state) => state.members);

  const loadMembers = (filters?: MemberFilters) => {
    dispatch(fetchMembers(filters));
  };

  const loadMemberById = (id: string) => {
    dispatch(fetchMemberById(id));
  };

  const addMember = (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    return dispatch(createMember(memberData));
  };

  const editMember = (id: string, memberData: Partial<Member>) => {
    return dispatch(updateMember({ id, memberData }));
  };

  const removeMember = (id: string) => {
    return dispatch(deleteMember(id));
  };

  const loadStats = () => {
    dispatch(fetchMemberStats());
  };

  const clearMessages = () => {
    dispatch(clearNotification());
  };

  const clearSelection = () => {
    dispatch(clearSelected());
  };

  const selectMember = (member: Member) => {
    dispatch(setSelectedMember(member));
  };

  return {
    // Estado
    members,
    selectedMember,
    loading,
    error,
    message,
    stats,
    
    // Acciones
    loadMembers,
    loadMemberById,
    addMember,
    editMember,
    removeMember,
    loadStats,
    clearMessages,
    clearSelection,
    selectMember
  };
};

// Hook para cargar miembros automáticamente
export const useMembersAutoLoad = (filters?: MemberFilters) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.members);
  
  useEffect(() => {
    dispatch(fetchMembers(filters));
  }, [dispatch, filters]);

  return {
    ...state,
    loadMembers: (filters?: MemberFilters) => dispatch(fetchMembers(filters)),
    loadMemberById: (id: string) => dispatch(fetchMemberById(id)),
    addMember: (memberData: Omit<Member, 'id' | 'createdAt'>) => 
      dispatch(createMember(memberData)),
    editMember: (id: string, memberData: Partial<Member>) => 
      dispatch(updateMember({ id, memberData })),
    removeMember: (id: string) => dispatch(deleteMember(id)),
    loadStats: () => dispatch(fetchMemberStats()),
    clearMessages: () => dispatch(clearNotification()),
    clearSelection: () => dispatch(clearSelected()),
    selectMember: (member: Member) => dispatch(setSelectedMember(member))
  };
};