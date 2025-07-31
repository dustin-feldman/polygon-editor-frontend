// src/store/workspaceSlice.js
import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspaces",
  initialState: {
    items: [], // list of all workspaces
    selectedId: null, // currently selected workspace ID
  },
  reducers: {
    setWorkspaces(state, action) {
      state.items = action.payload;
    },
    setSelectedWorkspace(state, action) {
      state.selectedId = action.payload;
    },
    clearSelectedWorkspace(state) {
      state.selectedId = null;
    },
  },
});

export const { setWorkspaces, setSelectedWorkspace, clearSelectedWorkspace } =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
