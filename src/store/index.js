import { configureStore } from "@reduxjs/toolkit";
import polygonsReducer from "./polygonsSlice";
import toolReducer from "./toolSlice";
import workspaceReducer from "./workspaceSlice";

const store = configureStore({
  reducer: {
    polygons: polygonsReducer,
    tools: toolReducer,
    workspaces: workspaceReducer,
  },
});

export default store;
