import api from "./axios";

export const fetchWorkspaces = () => api.get("/workspaces");
export const fetchWorkspacePages = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/pages`);
