import { useSelector } from "react-redux";
import type { RootState } from "../store/store";


export const useGuardian = () => {
  return useSelector((state: RootState) => state.guardians);
};