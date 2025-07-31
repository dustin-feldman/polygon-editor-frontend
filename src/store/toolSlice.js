import { createSlice } from "@reduxjs/toolkit";

const toolSlice = createSlice({
  name: "tools",
  initialState: {
    activeTool: null, // 'pin', 'vertex', 'select', etc.
  },
  reducers: {
    setActiveTool(state, action) {
      const tool = action.payload;
      state.activeTool = state.activeTool === tool ? null : tool;
    },
    exportToPdf() {
      console.log("Exporting to PDF...");
      // real export logic goes here
    },
  },
});

export const { setActiveTool, exportToPdf } = toolSlice.actions;
export default toolSlice.reducer;
