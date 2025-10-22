import { configureStore } from "@reduxjs/toolkit";

// Slices
import membersReducer from "./members/membersSlice";
import organigramaReducer from "./organigrama/organigramaSlice";
<<<<<<< HEAD
import organigramaCacheReducer from "./organigrama/organigramaCache.slice";
=======
import guardiansReducer from "./guardians/guardiansSlice";
>>>>>>> b250517 (Actualización de archivos de guardians en front)

// Configurar store
export const store = configureStore({
  reducer: {
    members: membersReducer,
    organigrama: organigramaReducer,
<<<<<<< HEAD
    organigramaCache: organigramaCacheReducer,
=======
    guardians: guardiansReducer,
>>>>>>> b250517 (Actualización de archivos de guardians en front)
    // Aquí puedes agregar otros reducers cuando los necesites
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
