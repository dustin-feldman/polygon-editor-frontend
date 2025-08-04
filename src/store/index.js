import { configureStore } from "@reduxjs/toolkit";
import polygonsReducer from "./polygonsSlice";
import toolReducer from "./toolSlice";
import workspaceReducer from "./workspaceSlice";
import editorReducer from "./editorSlice";

const store = configureStore({
  reducer: {
    polygons: polygonsReducer,
    tools: toolReducer,
    workspaces: workspaceReducer,
    editor: editorReducer,
  },
});

export default store;
