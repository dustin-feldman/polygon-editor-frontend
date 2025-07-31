import { useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
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

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = scale;
    const pointer = e.target.getStage().getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        scale={{ x: visualScale, y: visualScale }}
        position={position}
        draggable
        onWheel={handleWheel}
        onDragMove={(e) => setPosition(e.target.position())}
      >
        <Layer>
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
            onUpdateVertex={setSelectedPolygon} // for now just update local state
          />
        </Layer>
      </Stage>
    </div>
  );
}
