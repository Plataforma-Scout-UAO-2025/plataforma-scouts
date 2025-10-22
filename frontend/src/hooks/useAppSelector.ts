import { useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState } from "@/store/store"; 

// Hook tipado para usar el selector del store
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
