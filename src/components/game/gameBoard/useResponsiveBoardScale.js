import { useEffect, useState } from 'react';
import { BASE_CELL_SIZE } from './constants.js';

export const useResponsiveBoardScale = ({ containerRef, boardSize }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) {
        return;
      }

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const rect = container.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 24;

      const maxWidth = Math.max(240, containerWidth - 12);
      const maxHeight = Math.max(220, availableHeight);

      const boardWidth = boardSize.width * BASE_CELL_SIZE + 8;
      const boardHeight = boardSize.height * BASE_CELL_SIZE + 8;
      const scaleX = maxWidth / boardWidth;
      const scaleY = maxHeight / boardHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      const safeScale = Number.isFinite(newScale) ? newScale : 1;

      setScale(Math.max(safeScale, 0.4));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => window.removeEventListener('resize', updateScale);
  }, [boardSize.height, boardSize.width, containerRef]);

  return scale;
};
