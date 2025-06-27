import { VirtualSpace } from '@/types/space';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants/game';

export const defaultSpace: VirtualSpace = {
  id: 'default',
  name: 'Main Office',
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: '#f8fafc',
  obstacles: [
    // Office walls
    { id: 'wall1', x: 100, y: 100, width: 150, height: 20, type: 'wall', color: '#64748b' },
    { id: 'wall2', x: 300, y: 150, width: 20, height: 100, type: 'wall', color: '#64748b' },
    { id: 'wall3', x: 500, y: 200, width: 120, height: 20, type: 'wall', color: '#64748b' },
    
    // Meeting rooms
    { id: 'room1', x: 50, y: 50, width: 80, height: 80, type: 'wall', color: '#e2e8f0' },
    { id: 'room2', x: 600, y: 100, width: 100, height: 80, type: 'wall', color: '#e2e8f0' },
    
    // Tables
    { id: 'table1', x: 200, y: 300, width: 80, height: 40, type: 'table', color: '#8b4513' },
    { id: 'table2', x: 400, y: 350, width: 80, height: 40, type: 'table', color: '#8b4513' },
    { id: 'table3', x: 150, y: 450, width: 60, height: 30, type: 'table', color: '#8b4513' },
    
    // Chairs
    { id: 'chair1', x: 220, y: 280, width: 20, height: 20, type: 'chair', color: '#6b7280' },
    { id: 'chair2', x: 240, y: 280, width: 20, height: 20, type: 'chair', color: '#6b7280' },
    { id: 'chair3', x: 420, y: 330, width: 20, height: 20, type: 'chair', color: '#6b7280' },
    { id: 'chair4', x: 440, y: 330, width: 20, height: 20, type: 'chair', color: '#6b7280' },
  ],
  interactableAreas: [
    {
      id: 'meeting1',
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      type: 'meeting_room',
      label: 'Meeting Room A',
      maxParticipants: 6,
      currentParticipants: []
    },
    {
      id: 'meeting2',
      x: 600,
      y: 100,
      width: 100,
      height: 80,
      type: 'meeting_room',
      label: 'Meeting Room B',
      maxParticipants: 8,
      currentParticipants: []
    },
    {
      id: 'whiteboard1',
      x: 350,
      y: 50,
      width: 100,
      height: 20,
      type: 'whiteboard',
      label: 'Brainstorm Board',
      maxParticipants: 10,
      currentParticipants: []
    }
  ]
};