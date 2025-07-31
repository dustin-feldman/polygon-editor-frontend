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
  hoveredVertex,
  onHoverVertex,
  selectedVertex,
  onSelectVertex,
}) {
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

  // Separate visible polygons into selected and others
  const { selectedItem, others } = useMemo(() => {
    let selectedItem = null;
    const others = [];

    for (const poly of polygonIndex.search({
      minX: viewport.x,
      minY: viewport.y,
      maxX: viewport.x + viewport.width,
      maxY: viewport.y + viewport.height,
    })) {
      if (selectedPolygon?.id === poly.id) {
        selectedItem = poly;
      } else {
        others.push(poly);
      }
    }

    return { selectedItem, others };
  }, [polygonIndex, viewport, selectedPolygon]);

  // Render background polygons
  const backgroundPolygons = others.map((poly) => (
    <Line
      key={`poly-${poly.id}`}
      points={poly.scaledVertices.flat()}
      closed
      stroke="green"
      strokeWidth={2 / visualScale}
      opacity={0.4}
      onClick={() => onSelect(poly.raw)}
    />
  ));

  // Render selected polygon (if any)
  const selectedShape = selectedItem && (
    <Line
      key={`selected-${selectedItem.page_number}-${selectedItem.polygon_id}`}
      points={selectedItem.scaledVertices.flat()}
      closed
      stroke="blue"
      strokeWidth={3 / visualScale}
      opacity={0.8}
      onClick={() => onSelect(selectedItem.raw)}
    />
  );

  // Render editable vertices for the selected polygon
  const vertexHandles =
    selectedPolygon?.vertices?.[0]?.map(([x, y], index) => {
      const pageOffsetY = pageOffsets[selectedPolygon.page_number - 1] || 0;
      const scaledX = x * zoomFactor;
      const scaledY = y * zoomFactor + pageOffsetY;

      const isHovered =
        hoveredVertex?.polygonId === selectedPolygon.polygon_id &&
        hoveredVertex?.index === index;

      const isSelected =
        selectedVertex?.polygonId === selectedPolygon.polygon_id &&
        selectedVertex?.index === index;

      return (
        <Circle
          key={`v-${index}`}
          x={scaledX}
          y={scaledY}
          radius={isSelected ? 8 / visualScale : 6 / visualScale}
          fill={isHovered ? "yellow" : isSelected ? "blue" : "red"}
          draggable
          onMouseDown={(e) => (e.cancelBubble = true)}
          onTouchStart={(e) => (e.cancelBubble = true)}
          onDragStart={(e) => (e.cancelBubble = true)}
          onDragMove={(e) => {
            e.cancelBubble = true;

            const newX = e.target.x() / zoomFactor;
            const newY = (e.target.y() - pageOffsetY) / zoomFactor;

            const updated = [...selectedPolygon.vertices[0]];
            updated[index] = [newX, newY];

            onUpdateVertex({
              ...selectedPolygon,
              vertices: [updated],
            });
          }}
          onDragEnd={(e) => (e.cancelBubble = true)}
          onMouseEnter={() =>
            onHoverVertex?.({ polygonId: selectedPolygon.polygon_id, index })
          }
          onMouseLeave={() => onHoverVertex?.(null)}
          onClick={() =>
            onSelectVertex?.({ polygonId: selectedPolygon.polygon_id, index })
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
