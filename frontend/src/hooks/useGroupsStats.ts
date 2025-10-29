import { useEffect } from "react";
import { useGroup } from "./useGroup";
import { fetchActiveGroupsCountAction, fetchInactiveGroupsCountAction, fetchMembersCountByGroupAction, fetchTotalMembersCountAction } from "@/store/groups/groupsActions";
import { useAppDispatch } from "@/hooks/useAppDispatch";

export const useGroupsStats = () => {
  const { groups, memberCounts, totalMembersCount, activeGroupsCount, inactiveGroupsCount, loading } = useGroup();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMembersCountByGroupAction());
    dispatch(fetchTotalMembersCountAction());
    dispatch(fetchActiveGroupsCountAction());
    dispatch(fetchInactiveGroupsCountAction()); 
  }, [dispatch]);

  return { groups, memberCounts, totalMembersCount, activeGroupsCount, inactiveGroupsCount, loading };
};
