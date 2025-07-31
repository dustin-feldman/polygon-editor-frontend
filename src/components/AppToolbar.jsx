import { setActiveTool, exportToPdf } from "../store/toolSlice";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/ui/Button";
import WorkspaceSelector from "./WorkspaceSelector";
import {
  removeSelectedVertex,
  addVertexToPolygon,
} from "../store/polygonsSlice";
import { useEffect } from "react";
import api from "../api/axios"; // Your axios instance
import { showError, showSuccess } from "../utils/toast";

export default function AppToolbar({ onWorkspaceSelect }) {
  const dispatch = useDispatch();
  const activeTool = useSelector((state) => state.tools.activeTool);
  const selectedPolygonId = useSelector(
    (state) => state.polygons.selectedPolygonId
  );
  const selectedVertex = useSelector((state) => state.polygons.selectedVertex);
  const workspaceId = useSelector((state) => state.workspaces.selectedId);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "Delete" &&
        activeTool === "vertex" &&
        selectedPolygonId &&
        selectedVertex
      ) {
        dispatch(removeSelectedVertex());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, activeTool, selectedPolygonId, selectedVertex]);

  const exportToAnalysisJson = async (workspaceId) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/export-analysis/`);

      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workspace_${workspaceId}_analysis.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showSuccess("Exported analysis JSON successfully.");
    } catch (err) {
      console.error("Failed to export analysis:", err);
      showError("Failed to export analysis JSON.");
    }
  };

  const showVertexControls =
    activeTool === "vertex" && selectedPolygonId != null;

  return (
    <div className="app-toolbar bg-white p-4 border-b flex gap-4 items-center shadow-sm">
      <WorkspaceSelector onSelect={onWorkspaceSelect} />

      <Button
        onClick={() => dispatch(setActiveTool("pin"))}
        active={activeTool === "pin"}
      >
        Pin Tool
      </Button>

      <Button
        onClick={() => dispatch(setActiveTool("vertex"))}
        active={activeTool === "vertex"}
      >
        Vertex Tool
      </Button>

      {showVertexControls && (
        <>
          {selectedVertex && (
            <Button onClick={() => dispatch(addVertexToPolygon())}>
              + Add Point
            </Button>
          )}
          {selectedVertex && (
            <Button
              onClick={() => dispatch(removeSelectedVertex())}
              variant="danger"
            >
              - Remove Point
            </Button>
          )}
        </>
      )}

      <Button
        onClick={() => exportToAnalysisJson(workspaceId)}
        variant="outline"
      >
        Export JSON
      </Button>
    </div>
  );
}
