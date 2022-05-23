import { JSX } from '@statsify/rendering';
import { Canvas } from 'skia-canvas';

//TODO(jacobk999): Make this not use a white background
export const Background: JSX.FC = ({ children }) => {
  const canvas = new Canvas(1, 1);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, 1, 1);

  return (
    <img image={canvas} width="100%" height="100%">
      {children}
    </img>
  );
};
