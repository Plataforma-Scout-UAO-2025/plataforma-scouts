import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export const useMember = () => {
  return useSelector((state: RootState) => state.members);
};
