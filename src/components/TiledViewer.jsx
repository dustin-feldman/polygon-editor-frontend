import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import api from "../api/axios";
import TileLayer from "./TileLayer";
import PolygonLayer from "./PolygonLayer";
import { useViewport } from "../hooks/useViewport";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelection,
  setPolygons,
  updatePolygonVertices,
} from "../store/polygonsSlice";
import Swal from "sweetalert2";
import { showError, showSuccess } from "../utils/toast";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function TiledViewer({ workspaceId }) {
  const containerRef = useRef();
  const stageRef = useRef();
  const dispatch = useDispatch();

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const activeTool = useSelector((state) => state.tools.activeTool);
  const selectedPolygonId = useSelector(
    (state) => state.polygons.selectedPolygonId
  );
  const selectedPolygon = useSelector((state) =>
    state.polygons.polygons.find(
      (p) => p.id === state.polygons.selectedPolygonId
    )
  );
  const originalVertices = useSelector(
    (state) => state.polygons.originalVertices
  );
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const shouldClearSelectionRef = useRef(false);

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
    const handleKeyDown = (e) => {
      if (e.code === "Space") setIsSpacePressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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

  const [pages, setPages] = useState([]);
  useEffect(() => {
    api
      .get(`/workspaces/${workspaceId}/pages`)
      .then((res) => setPages(res.data || []));
    api
      .get(`/workspaces/${workspaceId}/polygons`)
      .then((res) => dispatch(setPolygons(res.data || [])));
  }, [workspaceId, dispatch]);

  const pageOffsets = pages.reduce((acc, page, i) => {
    const offset =
      i === 0 ? 0 : acc[i - 1] + page.height * Math.pow(2, zoomLevel - 6);
    return [...acc, offset];
  }, []);

  // Zoom + Pan
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

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const isBackground = e.target.name() === "background";
    const allowPan = activeTool === "pin" || isSpacePressed;

    if (isBackground) {
      shouldClearSelectionRef.current = true;
    } else {
      shouldClearSelectionRef.current = false;
    }

    if (isBackground || allowPan) {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
      stageRef.current.container().style.cursor = "grabbing";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      shouldClearSelectionRef.current = false; // Don't clear if user dragged
    }

    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      stageRef.current.container().style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  };

  const handleKonvaMouseUp = async (e) => {
    const isBackground = e.target.name && e.target.name() === "background";

    if (
      isBackground &&
      shouldClearSelectionRef.current &&
      !!selectedPolygonId
    ) {
      const currentVertices = JSON.stringify(selectedPolygon?.vertices?.[0]);
      const hasChanges =
        originalVertices && currentVertices !== originalVertices;

      if (hasChanges) {
        const result = await Swal.fire({
          title: "Unsaved Changes",
          text: "You have unsaved changes to this polygon.",
          icon: "warning",
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "Save",
          denyButtonText: `Don't Save`,
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          try {
            await api.patch(`/polygons/${selectedPolygon.id}/`, {
              vertices: selectedPolygon.vertices, // or vertices[0] depending on your serializer
            });

            dispatch(clearSelection());
            showSuccess("Polygon saved");
          } catch (error) {
            console.error("Failed to save polygon:", error);
            showError("Failed to save polygon");
          }
        } else if (result.isDenied) {
          if (selectedPolygon && originalVertices) {
            const parsed = JSON.parse(originalVertices);
            dispatch(
              updatePolygonVertices({
                polygonId: selectedPolygon.id,
                vertices: parsed,
              })
            );
          }

          dispatch(clearSelection());
        } else {
          // Cancel: do nothing
        }
      } else {
        dispatch(clearSelection());
      }
    }

    shouldClearSelectionRef.current = false;
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleKonvaMouseUp}
      >
        <Layer>
          <Group
            scale={{ x: visualScale, y: visualScale }}
            x={position.x}
            y={position.y}
          >
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
              pageOffsets={pageOffsets}
              zoomLevel={zoomLevel}
              visualScale={visualScale}
              viewport={viewport}
              scale={scale}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
