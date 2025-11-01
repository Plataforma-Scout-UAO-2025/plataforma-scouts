import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export const useGroup = () => {
  return useSelector((state: RootState) => state.groups);
};