export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 3;
export const INTERACTION_DISTANCE = 100;

export const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];