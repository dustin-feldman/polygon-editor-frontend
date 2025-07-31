// Tile.jsx
import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";

export default function Tile({ src, x, y, width, height }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (isMounted) setImage(img);
    };
    return () => {
      isMounted = false;
    };
  }, [src]);

  return image ? (
    <KonvaImage image={image} x={x} y={y} width={width} height={height} name="background"/>
  ) : null;
}
