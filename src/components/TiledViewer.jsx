import { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import api from "../api/axios";

const TILE_SIZE = 256;
const MAX_ZOOM_LEVEL = 6;
const MIN_ZOOM_LEVEL = 0;

function Tile({ src, x, y, width, height }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  return image ? (
    <KonvaImage image={image} x={x} y={y} width={width} height={height} />
  ) : null;
}

function isTileVisible(x, y, tileSize, viewport) {
  const tileRight = x + tileSize;
  const tileBottom = y + tileSize;
  const viewportRight = viewport.x + viewport.width;
  const viewportBottom = viewport.y + viewport.height;

  return (
    tileRight >= viewport.x &&
    x <= viewportRight &&
    tileBottom >= viewport.y &&
    y <= viewportBottom
  );
}

export default function TiledViewer({ workspaceId }) {
  const [pages, setPages] = useState([]);
  const stageRef = useRef();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (workspaceId) {
      api
        .get(`/workspaces/${workspaceId}/pages`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setPages(res.data);
          } else {
            console.warn("Unexpected response:", res.data);
            setPages([]);
          }
        })
        .catch((err) => {
          console.error("Failed to load pages", err);
          setPages([]);
        });
    }
  }, [workspaceId]);

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  // 🔍 Dynamically calculate tile zoom level based on current scale
  const zoomLevel = useMemo(() => {
    const z = MAX_ZOOM_LEVEL - Math.floor(Math.log2(1 / scale));
    return Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, z));
  }, [scale]);

  const zoomScaleFactor = Math.pow(2, MAX_ZOOM_LEVEL - zoomLevel);
  const visualScale = scale * zoomScaleFactor;

  const viewport = {
    x: -position.x / visualScale,
    y: -position.y / visualScale,
    width: stageWidth / visualScale,
    height: stageHeight / visualScale,
  };

  const tiles = useMemo(() => {
    const visibleTiles = [];
    let yOffset = 0;

    pages.forEach((page, index) => {
      const zoomScaleFactor = Math.pow(2, zoomLevel - MAX_ZOOM_LEVEL);
      const scaledWidth = Math.floor(page.width * zoomScaleFactor);
      const scaledHeight = Math.floor(page.height * zoomScaleFactor);

      const cols = Math.ceil(scaledWidth / TILE_SIZE);
      const rows = Math.ceil(scaledHeight / TILE_SIZE);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const tileW = Math.min(TILE_SIZE, scaledWidth - x * TILE_SIZE);
          const tileH = Math.min(TILE_SIZE, scaledHeight - y * TILE_SIZE);

          const tileX = x * TILE_SIZE;
          const tileY = yOffset + y * TILE_SIZE;

          if (isTileVisible(tileX, tileY, tileW, viewport)) {
            const src = `${
              import.meta.env.VITE_API_BASE_URL
            }/media/tiles/workspace_${workspaceId}/page_${
              index + 1
            }/${zoomLevel}/${x}/${y}.jpg`;

            visibleTiles.push(
              <Tile
                key={`${index}-${zoomLevel}-${x}-${y}`}
                src={src}
                x={tileX}
                y={tileY}
                width={tileW}
                height={tileH}
              />
            );
          }
        }
      }

      yOffset += scaledHeight;
    });

    return visibleTiles;
  }, [pages, scale, position, workspaceId, zoomLevel]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = scale;
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stageRef.current.x()) / oldScale,
      y: (pointer.y - stageRef.current.y()) / oldScale,
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
    <div>
      {zoomLevel},{scale},{visualScale}
      <Stage
        width={stageWidth}
        height={stageHeight}
        scale={{ x: visualScale, y: visualScale }}
        position={position}
        draggable
        onWheel={handleWheel}
        onDragMove={(e) => {
          const newPos = e.target.position();
          setPosition(newPos);
        }}
        ref={stageRef}
      >
        <Layer>{tiles}</Layer>
      </Stage>
    </div>
  );
}
