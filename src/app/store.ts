import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import channelReducer from "../features/channels/channelSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		channels: channelReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
