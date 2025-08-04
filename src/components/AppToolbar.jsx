import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveTool,
  setSidebarVisible,
} from "../store/editorSlice";
import {
  removeSelectedVertex,
  addVertexToPolygon,
} from "../store/polygonsSlice";
import api from "../api/axios";
import { showError, showSuccess } from "../utils/toast";
import Button from "../components/ui/Button";
import WorkspaceSelector from "./WorkspaceSelector";

export default function AppToolbar({ onWorkspaceSelect }) {
  const dispatch = useDispatch();

  const {
    activeTool,
    sidebarVisible,
  } = useSelector((state) => state.editor);

  const selectedPolygonId = useSelector(
    (state) => state.polygons.selectedPolygonId
  );
  const selectedVertex = useSelector(
    (state) => state.polygons.selectedVertex
  );
  const workspaceId = useSelector(
    (state) => state.workspaces.selectedId
  );

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
    <div className="app-toolbar bg-white px-4 py-2 border-b flex flex-wrap gap-2 items-center shadow-sm text-sm">
      <WorkspaceSelector onSelect={onWorkspaceSelect} />

      {/* Primary tools */}
      <Button
        onClick={() => dispatch(setActiveTool("draw"))}
        active={activeTool === "draw"}
      >
        ✏️ Draw
      </Button>
      <Button
        onClick={() => dispatch(setActiveTool("select"))}
        active={activeTool === "select"}
      >
        🖱️ Select
      </Button>
      <Button
        onClick={() => dispatch(setActiveTool("pan"))}
        active={activeTool === "pan"}
      >
        ✋ Pan
      </Button>

      {/* Contextual vertex editing */}
      {showVertexControls && (
        <>
          <Button onClick={() => dispatch(addVertexToPolygon())}>
            + Add Point
          </Button>
          <Button
            onClick={() => dispatch(removeSelectedVertex())}
            variant="danger"
          >
            - Remove Point
          </Button>
        </>
      )}

      {/* Utility actions */}
      <Button onClick={() => dispatch({ type: "editor/save" })} variant="success">
        💾 Save
      </Button>
      <Button onClick={() => dispatch({ type: "editor/undo" })}>↩️ Undo</Button>
      <Button onClick={() => dispatch({ type: "editor/redo" })}>↪️ Redo</Button>

      <Button
        onClick={() => exportToAnalysisJson(workspaceId)}
        variant="outline"
      >
        📤 Export JSON
      </Button>

      {/* Right panel toggle */}
      <Button
        onClick={() => dispatch(setSidebarVisible(!sidebarVisible))}
        variant="outline"
      >
        📊 {sidebarVisible ? "Hide" : "Show"} Panel
      </Button>
    </div>
  );
}
