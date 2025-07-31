import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Group, Circle, Line } from "react-konva";

const TestViewer = () => {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1.2);
  const [position, setPosition] = useState({ x: 50, y: 60 });

  const [rectPosition, setRectPosition] = useState({ x: 100, y: 100 });
  const [circlePositions, setCirclePositions] = useState([
    { x: 50, y: 50 },
    { x: 300, y: 150 },
    { x: 500, y: 300 },
  ]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = scale;

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Mouse-based drag to pan
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only start pan if the target is the background
    if (e.target.name() === 'background') {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.evt.clientX - lastPosRef.current.x;
    const dy = e.evt.clientY - lastPosRef.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCircleDragMove = (e, idx) => {
    const newPositions = [...circlePositions];
    newPositions[idx] = {
      x: e.target.x(),
      y: e.target.y(),
    };
    setCirclePositions(newPositions);
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={stageRef}
    >
      <Layer>
        <Group scale={{ x: scale, y: scale }} x={position.x} y={position.y}>
          {/* Fullscreen draggable background */}
          <Rect
            name="background"
            x={-10000} // covers large area
            y={-10000}
            width={20000}
            height={20000}
            fill="#f8f8f8"
          />

          {/* Background polygon connecting all circles */}
          <Line
            points={circlePositions.flatMap((p) => [p.x, p.y])}
            closed
            fill="lightblue"
            stroke="blue"
            strokeWidth={2}
            opacity={0.5}
          />

          {/* Draggable Rect Group */}
          <Group
            draggable
            onDragMove={(e) =>
              setRectPosition({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
          >
            <Rect
              x={0}
              y={0}
              width={100}
              height={100}
              fill="tomato"
              draggable={false}
            />
          </Group>

          {/* Draggable Diagnostic Points (each in its own group) */}
          {circlePositions.map((point, idx) => (
            <Group
              key={idx}
              x={point.x}
              y={point.y}
              draggable
              onDragMove={(e) => handleCircleDragMove(e, idx)}
            >
              <Circle
                x={0}
                y={0}
                radius={5}
                fill="blue"
                stroke="white"
                strokeWidth={1}
                onClick={() => console.log("Clicked diagnostic point", idx)}
              />
            </Group>
          ))}
        </Group>
      </Layer>
    </Stage>
  );
};

export default TestViewer;

// -----------------------------
// Canvas Interaction Summary
// -----------------------------
// - The <Stage> captures mouse wheel zooming and mouse drag events.
// - A large invisible <Rect> named "background" allows users to drag the entire canvas
//   by clicking and dragging empty space (panning the view).
// - All shapes are nested in a top-level <Group> which receives scale (zoom) and position (pan).
// - The <Rect> (tomato box) is wrapped in a draggable <Group> to allow individual movement.
// - Each diagnostic point (<Circle>) is also inside a draggable <Group> for independent movement.
// - Dragging a circle updates its position in state, which dynamically updates the connecting polygon (<Line>).
// - This structure enables smooth zooming, panning, and individual shape interaction on a single canvas.
