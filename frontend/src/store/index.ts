import { configureStore } from '@reduxjs/toolkit';
import membersReducer from './membersSlice';
// import eventsReducer from './eventsSlice';
// import badgesReducer from './badgesSlice';

export const store = configureStore({
  reducer: {
    members: membersReducer,
    // events: eventsReducer,
    // badges: badgesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;