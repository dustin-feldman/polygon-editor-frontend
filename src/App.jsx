import { useState } from "react";
import WorkspaceSelector from "./components/WorkspaceSelector";
import TiledViewer from "./components/TiledViewer";
import "./App.css";

export default function App() {
  const [workspaceId, setWorkspaceId] = useState(null);

  return (
    <div className="app-container">
      <div className="app-toolbar">
        <WorkspaceSelector onSelect={setWorkspaceId} />
      </div>
      <div className="app-content">
        {workspaceId && <TiledViewer workspaceId={workspaceId} />}
      </div>
    </div>
  );
}
