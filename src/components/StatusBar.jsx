// components/StatusBar.jsx
export default function StatusBar({
  currentPage = 1,
  activeTool = "Select",
  zoomLevel = 100,
  hasUnsavedChanges = false,
}) {
  return (
    <footer className="shrink-0 h-8 bg-gray-800 text-white text-sm px-4 flex items-center justify-between">
      <span>Page: {currentPage}</span>
      <span>Tool: {activeTool}</span>
      <span>Zoom: {zoomLevel}%</span>
      <span>Status: {hasUnsavedChanges ? "Unsaved Changes" : "Saved"}</span>
    </footer>
  );
}
