import { useEffect } from "react";
import { useGroup } from "./useGroup";
import { fetchMembersCountByGroupAction } from "@/store/groups/groupsActions";
import { useAppDispatch } from "./useAppDispatch";

export const useGroupsStats = () => {
  const { groups } = useGroup();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMembersCountByGroupAction());
  }, [dispatch]);

  console.log("Groups from useGroupsStats:", groups);
  return { groups };
};
