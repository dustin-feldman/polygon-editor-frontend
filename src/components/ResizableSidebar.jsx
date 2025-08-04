import { useRef } from "react";

export default function ResizableSidebar({ width, onResize, children }) {
  const startXRef = useRef(null);
  const startWidthRef = useRef(null);

  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const onMouseMove = (e) => {
      const delta = startXRef.current - e.clientX; // ← left = shrink, → right = grow
      const newWidth = Math.max(240, startWidthRef.current + delta);
      onResize(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex h-full">
      {/* 📏 Resizer Handle (left edge) */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 cursor-ew-resize bg-gray-200 hover:bg-gray-400"
      />
      {/* 📊 Sidebar Content */}
      <div
        className="h-full bg-white border-l border-gray-300"
        style={{ width }}
      >
        {children}
      </div>
    </div>
  );
}
