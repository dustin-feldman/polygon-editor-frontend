// store/editorSlice.js
import { createSlice } from "@reduxjs/toolkit";

const editorSlice = createSlice({
  name: "editor",
  initialState: {
    activeTool: "select",       // 'draw', 'select', 'pan', etc.
    zoomLevel: 100,             // in percentage
    currentPage: 1,             // currently viewed page
    hasUnsavedChanges: false,   // dirty flag
    sidebarVisible: true,       // right panel visibility
    sidebarWidth: 300,          // px
    selectedPolygons: [],       // array of selected polygon IDs
  },
  reducers: {
    setActiveTool(state, action) {
      const tool = action.payload;
      state.activeTool = state.activeTool === tool ? null : tool;
    },
    setZoomLevel(state, action) {
      state.zoomLevel = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setHasUnsavedChanges(state, action) {
      state.hasUnsavedChanges = action.payload;
    },
    setSidebarVisible(state, action) {
      state.sidebarVisible = action.payload;
    },
    setSidebarWidth(state, action) {
      state.sidebarWidth = action.payload;
    },
    setSelectedPolygons(state, action) {
      state.selectedPolygons = action.payload;
    },
    exportToPdf() {
      console.log("Exporting to PDF...");
      // Implement real export logic
    },
  },
});

export const {
  setActiveTool,
  setZoomLevel,
  setCurrentPage,
  setHasUnsavedChanges,
  setSidebarVisible,
  setSidebarWidth,
  setSelectedPolygons,
  exportToPdf,
} = editorSlice.actions;

export default editorSlice.reducer;
