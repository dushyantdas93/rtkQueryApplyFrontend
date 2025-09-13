import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./rtkAsychSlices/authSlice";
import metaDataSlice from "./rtkAsychSlices/metaDataSlice";
import { searchV3 } from "./rtkQuerySlices/searchV3Slice";
import { metaDataQuery } from "./rtkQuerySlices/metaDataQuerySlice";

// Create store
export const store = configureStore({
  reducer: {
    [searchV3.reducerPath]: searchV3.reducer,
    [metaDataQuery.reducerPath]: metaDataQuery.reducer,
    auth: authReducer,
    metaData: metaDataSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(searchV3.middleware,metaDataQuery.middleware),
  // getDefaultMiddleware().concat(metaDataQuery.middleware),
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
