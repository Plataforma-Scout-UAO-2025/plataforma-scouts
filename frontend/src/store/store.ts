import { configureStore } from "@reduxjs/toolkit";

// Slices
import membersReducer from "./members/membersSlice";
import organigramaReducer from "./organigrama/organigramaSlice";

// Configurar store
export const store = configureStore({
  reducer: {
    members: membersReducer,
    organigrama: organigramaReducer,
    
    // Aquí puedes agregar otros reducers cuando los necesites
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;