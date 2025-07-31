import { useState } from "react";
import WorkspaceSelector from "./components/WorkspaceSelector";
import TiledViewer from "./components/TiledViewer";

export default function App() {
  const [workspaceId, setWorkspaceId] = useState(null);

  return (
    <>
      <WorkspaceSelector onSelect={setWorkspaceId} />
      {workspaceId && <TiledViewer workspaceId={workspaceId} />}
    </>
  );
}
