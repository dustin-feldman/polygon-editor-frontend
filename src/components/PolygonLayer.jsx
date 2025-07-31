import { useMemo } from "react";
import { Line, Circle } from "react-konva";
import RBush from "rbush";
import { getBoundingBox } from "../utils/geometry";

export default function PolygonLayer({
  polygons,
  pageOffsets,
  zoomLevel,
  visualScale,
  viewport,
  selectedPolygon,
  onSelect,
  onUpdateVertex,
}) {
  const zoomFactor = Math.pow(2, zoomLevel - 6);

  // Build spatial index
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
        polygon_id: poly.polygon_id,
        page_number: poly.page_number,
        raw: poly,
      };
    });
    tree.load(items);
    return tree;
  }, [polygons, pageOffsets, zoomLevel]);

  // Filter visible polygons
  const visiblePolygons = useMemo(() => {
    return polygonIndex.search({
      minX: viewport.x,
      minY: viewport.y,
      maxX: viewport.x + viewport.width,
      maxY: viewport.y + viewport.height,
    });
  }, [polygonIndex, viewport]);

  // Render polygons
  const polygonShapes = visiblePolygons.map((poly) => (
    <Line
      key={`poly-${poly.page_number}-${poly.polygon_id}`}
      points={poly.scaledVertices.flat()}
      closed
      stroke={
        selectedPolygon?.polygon_id === poly.polygon_id ? "blue" : "green"
      }
      strokeWidth={3 / visualScale}
      opacity={0.6}
      onClick={() => {
        onSelect(poly.raw);
      }}
    />
  ));

  // Render editable vertices if selected
  const vertexHandles = selectedPolygon?.vertices?.[0]?.map(([x, y], index) => {
    const pageOffsetY = pageOffsets[selectedPolygon.page_number - 1] || 0;
    const scaledX = x * zoomFactor;
    const scaledY = y * zoomFactor + pageOffsetY;

    return (
      <Circle
        key={`v-${index}`}
        x={scaledX}
        y={scaledY}
        radius={6 / visualScale}
        fill="red"
        draggable
        onDragEnd={(e) => {
          const newX = e.target.x() / zoomFactor;
          const newY = (e.target.y() - pageOffsetY) / zoomFactor;

          console.log(newX, newY);

          const updated = [...selectedPolygon.vertices[0]];
          updated[index] = [newX, newY];

          console.log([...selectedPolygon.vertices[0]]);
          console.log(updated);

          onUpdateVertex({
            ...selectedPolygon,
            vertices: [updated],
          });
        }}
      />
    );
  });

  return (
    <>
      {polygonShapes}
      {vertexHandles}
    </>
  );
}
