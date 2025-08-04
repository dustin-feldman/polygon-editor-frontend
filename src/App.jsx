import { useState } from "react";
import AppToolbar from "./components/AppToolbar";
import TiledViewer from "./components/TiledViewer";
import SidebarTabs from "./components/SidebarTabs";
import StatusBar from "./components/StatusBar";
import ResizableSidebar from "./components/ResizableSidebar";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarWidth } from "./store/editorSlice";

export default function App() {
  const [workspaceId, setWorkspaceId] = useState(null);

  const dispatch = useDispatch();
  const sidebarVisible = useSelector((state) => state.editor.sidebarVisible);
  const sidebarWidth = useSelector((state) => state.editor.sidebarWidth);

  return (
    <div className="flex flex-col h-screen">
      {/* 🔧 Header: Toolbar */}
      <header className="shrink-0">
        <AppToolbar onWorkspaceSelect={setWorkspaceId} />
      </header>

      {/* 🖼️ Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Viewer */}
        <div className="flex-1 relative bg-gray-100">
          {workspaceId ? (
            <TiledViewer workspaceId={workspaceId} />
          ) : (
            <div className="h-full flex items-center justify-center text-red-400">
              Please select a workspace.
            </div>
          )}
        </div>

        {workspaceId && sidebarVisible && (
          <ResizableSidebar
            width={sidebarWidth}
            onResize={(w) => dispatch(setSidebarWidth(w))}
          >
            <SidebarTabs />
          </ResizableSidebar>
        )}
      </div>

      {/* ℹ️ Status Bar */}
      <footer className="shrink-0 h-8 bg-gray-800 text-white text-sm px-4 flex items-center justify-between">
        <span>Page: 1</span>
        <span>Tool: Select</span>
        <span>Zoom: 100%</span>
        <span>Status: Saved</span>
      </footer>
    </div>
  );
}
