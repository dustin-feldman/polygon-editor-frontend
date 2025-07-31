import { useMemo, useState } from "react";

export function useViewport(stageWidth, stageHeight) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const MAX_ZOOM_LEVEL = 6;
  const MIN_ZOOM_LEVEL = 0;

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

  return {
    scale,
    setScale,
    position,
    setPosition,
    zoomLevel,
    visualScale,
    viewport,
    zoomScaleFactor,
  };
}
