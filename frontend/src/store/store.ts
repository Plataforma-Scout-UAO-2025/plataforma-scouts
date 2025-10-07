import { configureStore } from "@reduxjs/toolkit";

// Slices
import membersReducer from "./members/membersSlice";

// Configurar store
export const store = configureStore({
  reducer: {
    members: membersReducer,
    // Aquí puedes agregar otros reducers cuando los necesites
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;