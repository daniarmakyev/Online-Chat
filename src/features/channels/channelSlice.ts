import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Channel } from "../../types";

interface ChannelState {
	channels: Channel[];
	selectedChannel: string | null;
}

const initialState: ChannelState = {
	channels: [],
	selectedChannel: null,
};

const channelSlice = createSlice({
	name: "channels",
	initialState,
	reducers: {
		setChannels: (state, action: PayloadAction<Channel[]>) => {
			state.channels = action.payload;
		},
		setSelectedChannel: (state, action: PayloadAction<string | null>) => {
			state.selectedChannel = action.payload;
		},
	},
});

export const { setChannels, setSelectedChannel } = channelSlice.actions;
export default channelSlice.reducer;
