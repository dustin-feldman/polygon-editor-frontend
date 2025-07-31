import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import api from "../api/axios";
import TileLayer from "./TileLayer";
import PolygonLayer from "./PolygonLayer";
import { useViewport } from "../hooks/useViewport";

export default function TiledViewer({ workspaceId }) {
  const containerRef = useRef();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pages, setPages] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [hoveredVertex, setHoveredVertex] = useState(null);
  const [selectedVertex, setSelectedVertex] = useState(null);
  const stageRef = useRef();

  // Setup viewport
  const {
    scale,
    setScale,
    position,
    setPosition,
    zoomLevel,
    visualScale,
    viewport,
  } = useViewport(containerSize.width, containerSize.height);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    api
      .get(`/workspaces/${workspaceId}/pages`)
      .then((res) => setPages(res.data || []));
    api
      .get(`/workspaces/${workspaceId}/polygons`)
      .then((res) => setPolygons(res.data || []));
  }, [workspaceId]);

  const pageOffsets = pages.reduce((acc, page, i) => {
    const offset =
      i === 0 ? 0 : acc[i - 1] + page.height * Math.pow(2, zoomLevel - 6);
    return [...acc, offset];
  }, []);

  // Zoom logic
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const oldScale = scale;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const newPosition = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPosition);
  };

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.name() === "background") {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };

      // Set cursor to grabbing
      stageRef.current.container().style.cursor = "grabbing";

      // Attach global listeners
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;

      // Reset cursor
      stageRef.current.container().style.cursor = "default";

      // Cleanup
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  };

  const handleVertexUpdate = (updatedPolygon) => {
    setSelectedPolygon((prev) => {
      if (!prev) return prev;
      return { ...prev, vertices: updatedPolygon.vertices };
    });

    setPolygons((prevPolygons) =>
      prevPolygons.map((p) =>
        p.polygon_id === updatedPolygon.polygon_id
          ? { ...p, vertices: updatedPolygon.vertices }
          : p
      )
    );
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Position x</th>
            <th>Position y</th>
            <th>Scale</th>
            <th>Visual Scale</th>
            <th>view - x</th>
            <th>view - y</th>
            <th>view - w</th>
            <th>view - h</th>
            <th>zoomLevel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{position.x.toFixed(2)}</td>
            <td>{position.y.toFixed(2)}</td>
            <td>{scale.toFixed(2)}</td>
            <td>{visualScale.toFixed(2)}</td>
            <td>{viewport.x.toFixed(2)}</td>
            <td>{viewport.y.toFixed(2)}</td>
            <td>{viewport.width.toFixed(2)}</td>
            <td>{viewport.height.toFixed(2)}</td>
            <td>{zoomLevel}</td>
          </tr>
        </tbody>
      </table>
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <Layer>
          <Group scale={{ x: visualScale, y: visualScale }} x={position.x} y={position.y}>
            {/* Large background for dragging the canvas */}

            <Rect
              name="background"
              x={-10000}
              y={-10000}
              width={20000}
              height={20000}
              fill="#f8f8f8"
              opacity={0}
            />
            <TileLayer
              pages={pages}
              workspaceId={workspaceId}
              zoomLevel={zoomLevel}
              viewport={viewport}
            />
            <PolygonLayer
              polygons={polygons}
              pageOffsets={pageOffsets}
              zoomLevel={zoomLevel}
              visualScale={visualScale}
              viewport={viewport}
              selectedPolygon={selectedPolygon}
              onSelect={setSelectedPolygon}
              onUpdateVertex={handleVertexUpdate}
              hoveredVertex={hoveredVertex}
              onHoverVertex={setHoveredVertex}
              selectedVertex={selectedVertex}
              onSelectVertex={setSelectedVertex}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
