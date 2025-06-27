import { Player } from '@/types/game';
import { Obstacle } from '@/types/space';
import { PLAYER_SIZE } from '@/constants/game';

export function checkCollision(
  player: Player,
  obstacles: Obstacle[]
): boolean {
  const playerRadius = PLAYER_SIZE / 2;
  
  for (const obstacle of obstacles) {
    // Check if player circle intersects with obstacle rectangle
    const closestX = Math.max(obstacle.x, Math.min(player.x, obstacle.x + obstacle.width));
    const closestY = Math.max(obstacle.y, Math.min(player.y, obstacle.y + obstacle.height));
    
    const distanceX = player.x - closestX;
    const distanceY = player.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    if (distanceSquared < playerRadius * playerRadius) {
      return true;
    }
  }
  
  return false;
}

export function getValidPosition(
  newX: number,
  newY: number,
  obstacles: Obstacle[],
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const playerRadius = PLAYER_SIZE / 2;
  
  // Check canvas boundaries
  const boundedX = Math.max(playerRadius, Math.min(canvasWidth - playerRadius, newX));
  const boundedY = Math.max(playerRadius, Math.min(canvasHeight - playerRadius, newY));
  
  const testPlayer: Player = {
    id: 'test',
    name: 'test',
    x: boundedX,
    y: boundedY,
    color: 'test'
  };
  
  // If no collision, return the bounded position
  if (!checkCollision(testPlayer, obstacles)) {
    return { x: boundedX, y: boundedY };
  }
  
  // If collision, try to find a nearby valid position
  const searchRadius = 20;
  for (let angle = 0; angle < 360; angle += 45) {
    const radians = (angle * Math.PI) / 180;
    const testX = boundedX + Math.cos(radians) * searchRadius;
    const testY = boundedY + Math.sin(radians) * searchRadius;
    
    const adjustedX = Math.max(playerRadius, Math.min(canvasWidth - playerRadius, testX));
    const adjustedY = Math.max(playerRadius, Math.min(canvasHeight - playerRadius, testY));
    
    testPlayer.x = adjustedX;
    testPlayer.y = adjustedY;
    
    if (!checkCollision(testPlayer, obstacles)) {
      return { x: adjustedX, y: adjustedY };
    }
  }
  
  // If still no valid position found, return the original position
  return { x: boundedX, y: boundedY };
}

export function calculateDistance(
  player1: Player,
  player2: Player
): number {
  const dx = player1.x - player2.x;
  const dy = player1.y - player2.y;
  return Math.sqrt(dx * dx + dy * dy);
}