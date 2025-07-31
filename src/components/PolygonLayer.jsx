import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Line, Circle } from "react-konva";
import RBush from "rbush";
import { getBoundingBox } from "../utils/geometry";
import {
  setSelectedPolygon,
  updatePolygonVertices,
  setHoveredVertex,
  setSelectedVertex,
} from "../store/polygonsSlice"; // adjust import path

export default function PolygonLayer({
  pageOffsets,
  zoomLevel,
  visualScale,
  viewport,
  scale,
}) {
  const dispatch = useDispatch();

  const polygons = useSelector((state) => state.polygons.polygons);
  const selectedPolygonId = useSelector(
    (state) => state.polygons.selectedPolygonId
  );
  const selectedVertex = useSelector((state) => state.polygons.selectedVertex);
  const hoveredVertex = useSelector((state) => state.polygons.hoveredVertex);

  const selectedPolygon = useMemo(
    () => polygons.find((p) => p.id === selectedPolygonId),
    [polygons, selectedPolygonId]
  );

  const zoomFactor = Math.pow(2, zoomLevel - 6);

  // Build spatial index of all polygons with scaled positions
  const polygonIndex = useMemo(() => {
    const tree = new RBush();
    const items = polygons.map((poly) => {
      const pageOffsetY = pageOffsets[poly.page_number - 1] || 0;
      const scaledVertices = poly.vertices?.[0].map(([x, y]) => [
        x * zoomFactor,
        y * zoomFactor + pageOffsetY,
      ]);
      const bounds = getBoundingBox(scaledVertices);

      return {
        minX: bounds.minX,
        minY: bounds.minY,
        maxX: bounds.maxX,
        maxY: bounds.maxY,
        scaledVertices,
        id: poly.id,
        polygon_id: poly.polygon_id,
        page_number: poly.page_number,
        raw: poly,
      };
    });
    tree.load(items);
    return tree;
  }, [polygons, pageOffsets, zoomLevel]);

  const { selectedItem, others } = useMemo(() => {
    let selectedItem = null;
    const others = [];

    for (const poly of polygonIndex.search({
      minX: viewport.x,
      minY: viewport.y,
      maxX: viewport.x + viewport.width,
      maxY: viewport.y + viewport.height,
    })) {
      if (selectedPolygonId === poly.id) {
        selectedItem = poly;
      } else {
        others.push(poly);
      }
    }

    return { selectedItem, others };
  }, [polygonIndex, viewport, selectedPolygonId]);

  const backgroundPolygons = others.map((poly) => (
    <Line
      key={`poly-${poly.id}`}
      points={poly.scaledVertices.flat()}
      closed
      stroke="green"
      strokeWidth={2 / visualScale}
      opacity={0.4}
      onClick={() => dispatch(setSelectedPolygon(poly.id))}
    />
  ));

  const selectedShape = selectedItem && (
    <Line
      key={`selected-${selectedItem.id}`}
      points={selectedItem.scaledVertices.flat()}
      closed
      stroke="blue"
      strokeWidth={0.3 / Math.max(1, scale) * 6}
      opacity={0.8}
      onClick={() => dispatch(setSelectedPolygon(selectedItem.id))}
    />
  );

  const vertexHandles =
    selectedPolygon?.vertices?.[0]?.map(([x, y], index) => {
      const pageOffsetY = pageOffsets[selectedPolygon.page_number - 1] || 0;
      const scaledX = x * zoomFactor;
      const scaledY = y * zoomFactor + pageOffsetY;

      const isHovered =
        hoveredVertex?.polygonId === selectedPolygon.id &&
        hoveredVertex?.index === index;

      const isSelected =
        selectedVertex?.polygonId === selectedPolygon.id &&
        selectedVertex?.index === index;

      const radius = isSelected ? 1.5 : 1.2;

      return (
        <Circle
          key={`v-${index}`}
          x={scaledX}
          y={scaledY}
          radius={radius / Math.max(1, scale) * 3}
          fill={isHovered ? "yellow" : isSelected ? "blue" : "red"}
          draggable
          onMouseDown={(e) => (e.cancelBubble = true)}
          onTouchStart={(e) => (e.cancelBubble = true)}
          onDragStart={(e) => {
            e.cancelBubble = true;
            dispatch(
              setSelectedVertex({ polygonId: selectedPolygon.id, index })
            );
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;

            const newX = e.target.x() / zoomFactor;
            const newY = (e.target.y() - pageOffsetY) / zoomFactor;

            const updated = [...selectedPolygon.vertices[0]];
            updated[index] = [newX, newY];

            dispatch(
              updatePolygonVertices({
                polygonId: selectedPolygon.id,
                vertices: updated,
              })
            );
          }}
          onDragEnd={(e) => (e.cancelBubble = true)}
          onMouseEnter={() =>
            dispatch(setHoveredVertex({ polygonId: selectedPolygon.id, index }))
          }
          onMouseLeave={() => dispatch(setHoveredVertex(null))}
          onClick={() =>
            dispatch(
              setSelectedVertex({ polygonId: selectedPolygon.id, index })
            )
          }
        />
      );
    }) ?? [];

  return (
    <>
      {backgroundPolygons}
      {selectedShape}
      {vertexHandles}
    </>
  );
}
