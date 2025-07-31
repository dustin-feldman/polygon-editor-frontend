import { useMemo } from "react";
import Tile from "./Tile"; // <-- import the new version

function isTileVisible(x, y, tileW, viewport) {
  const tileRight = x + tileW;
  const tileBottom = y + tileW;
  const viewportRight = viewport.x + viewport.width;
  const viewportBottom = viewport.y + viewport.height;

  return (
    tileRight >= viewport.x &&
    x <= viewportRight &&
    tileBottom >= viewport.y &&
    y <= viewportBottom
  );
}

export default function TileLayer({ pages, workspaceId, zoomLevel, viewport }) {
  const TILE_SIZE = 256;

  const tiles = useMemo(() => {
    const visibleTiles = [];
    let yOffset = 0;
    const zoomFactor = Math.pow(2, zoomLevel - 6);

    pages.forEach((page, index) => {
      const scaledWidth = Math.floor(page.width * zoomFactor);
      const scaledHeight = Math.floor(page.height * zoomFactor);
      const cols = Math.ceil(scaledWidth / TILE_SIZE);
      const rows = Math.ceil(scaledHeight / TILE_SIZE);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const tileX = x * TILE_SIZE;
          const tileY = yOffset + y * TILE_SIZE;

          const tileW = Math.min(TILE_SIZE, scaledWidth - x * TILE_SIZE);
          const tileH = Math.min(TILE_SIZE, scaledHeight - y * TILE_SIZE);

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
                name="background"
              />
            );
          }
        }
      }

      yOffset += scaledHeight;
    });

    return visibleTiles;
  }, [pages, zoomLevel, workspaceId, viewport]);

  return <>{tiles}</>;
}
