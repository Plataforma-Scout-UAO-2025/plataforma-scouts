import { configureStore } from "@reduxjs/toolkit";

// Slices
import membersReducer from "./members/membersSlice";
import groupsReducer from "./groups/groupsSlice";
import organigramaReducer from "./organigrama/organigramaSlice";
import organigramaCacheReducer from "./organigrama/organigramaCache.slice";
import guardiansReducer from "./guardians/guardiansSlice";

// Configurar store
export const store = configureStore({
  reducer: {
    members: membersReducer,
    groups: groupsReducer,
    organigrama: organigramaReducer,
    organigramaCache: organigramaCacheReducer,
    guardians: guardiansReducer
    // Aquí puedes agregar otros reducers cuando los necesites
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
