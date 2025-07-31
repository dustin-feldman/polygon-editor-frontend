import { createSlice } from "@reduxjs/toolkit";

const polygonsSlice = createSlice({
  name: "polygons",
  initialState: {
    polygons: [],
    selectedPolygonId: null,
    selectedVertex: null,
    hoveredVertex: null,
    originalVertices: null,
  },
  reducers: {
    setPolygons(state, action) {
      state.polygons = action.payload;
    },
    updatePolygonVertices(state, action) {
      const { polygonId, vertices } = action.payload;
      const polygon = state.polygons.find((p) => p.id === polygonId);
      if (polygon) {
        polygon.vertices = [vertices];
      }
    },
    setSelectedPolygon(state, action) {
      const polygonId = action.payload;
      const polygon = state.polygons.find((p) => p.id === polygonId);
      if (!polygon) return;

      state.selectedPolygonId = polygonId;
      state.selectedVertex = null;
      state.originalVertices = JSON.stringify(polygon.vertices[0]); // Save snapshot
    },
    setSelectedVertex(state, action) {
      state.selectedVertex = action.payload;
    },
    setHoveredVertex(state, action) {
      state.hoveredVertex = action.payload;
    },
    clearSelection(state) {
      state.selectedPolygonId = null;
      state.selectedVertex = null;
      state.hoveredVertex = null;
    },
    addVertexToPolygon(state) {
      const polygonId = state.selectedPolygonId;
      const selected = state.selectedVertex;

      if (!polygonId || !selected || selected.polygonId !== polygonId) return;

      const polygon = state.polygons.find((p) => p.id === polygonId);
      if (!polygon) return;

      const vertices = [...polygon.vertices[0]];
      const idx = selected.index;

      const prev = vertices[(idx - 1 + vertices.length) % vertices.length];
      const next = vertices[(idx + 1) % vertices.length];

      const mid = [(prev[0] + next[0]) / 2, (prev[1] + next[1]) / 2];

      vertices.splice(idx + 1, 0, mid);
      polygon.vertices = [vertices];

      // Optional: select new point
      state.selectedVertex = { polygonId, index: idx + 1 };
    },

    removeSelectedVertex(state) {
      const selected = state.selectedVertex;
      if (!selected) return;

      const polygon = state.polygons.find((p) => p.id === selected.polygonId);
      if (!polygon) return;

      const vertices = [...polygon.vertices[0]];
      if (vertices.length <= 3) return; // Prevent invalid shape

      vertices.splice(selected.index, 1);
      polygon.vertices = [vertices];

      state.selectedVertex = null;
    },
  },
});

export const {
  setPolygons,
  updatePolygonVertices,
  setSelectedPolygon,
  setSelectedVertex,
  setHoveredVertex,
  clearSelection,
  addVertexToPolygon,
  removeSelectedVertex,
} = polygonsSlice.actions;

export default polygonsSlice.reducer;
