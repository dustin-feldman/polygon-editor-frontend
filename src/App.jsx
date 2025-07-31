import { useState } from "react";
import AppToolbar from "./components/AppToolbar";
import TiledViewer from "./components/TiledViewer";

export default function App() {
  const [workspaceId, setWorkspaceId] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <AppToolbar onWorkspaceSelect={setWorkspaceId} />
      <div className="flex-1">
        {workspaceId ? (
          <TiledViewer workspaceId={workspaceId} />
        ) : (
          <div className="h-full flex items-center justify-center text-red-200">
            Please select a workspace.
          </div>
        )}
      </div>
    </div>
  );
}
