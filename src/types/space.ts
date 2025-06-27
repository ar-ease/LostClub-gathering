export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'table' | 'chair' | 'decoration';
  color: string;
}

export interface InteractableArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'meeting_room' | 'presentation' | 'whiteboard';
  label: string;
  maxParticipants: number;
  currentParticipants: string[];
}

export interface VirtualSpace {
  id: string;
  name: string;
  width: number;
  height: number;
  obstacles: Obstacle[];
  interactableAreas: InteractableArea[];
  backgroundColor: string;
}