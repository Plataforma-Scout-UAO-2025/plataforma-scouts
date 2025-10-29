import { useGroup } from "./useGroup";
//import { fetchMembersCountByGroupAction } from "@/store/groups/groupsActions";

export const useGroupsStats = () => {
  const { groups } = useGroup();

  console.log("Groups from useGroupsStats:", groups);
  return { groups };
};
