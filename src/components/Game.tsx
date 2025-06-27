'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player } from '@/types/game';
import { VirtualSpace, InteractableArea } from '@/types/space';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, PLAYER_SPEED, getRandomColor, INTERACTION_DISTANCE } from '@/constants/game';
import { getValidPosition, calculateDistance } from '@/utils/collision';
import { defaultSpace } from '@/data/defaultSpace';

interface GameProps {
  playerId: string;
  playerName: string;
}

export default function Game({ playerId, playerName }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    id: playerId,
    name: playerName,
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    color: getRandomColor()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [space] = useState<VirtualSpace>(defaultSpace);
  const [nearbyAreas, setNearbyAreas] = useState<InteractableArea[]>([]);

  const keysPressed = useRef<Set<string>>(new Set());
  const lastEmittedPosition = useRef({ x: 0, y: 0 });

  const updatePlayerPosition = useCallback(() => {
    setCurrentPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
        newY = newY - PLAYER_SPEED;
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
        newY = newY + PLAYER_SPEED;
      }
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
        newX = newX - PLAYER_SPEED;
      }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
        newX = newX + PLAYER_SPEED;
      }

      // Apply collision detection and boundary checking
      const validPosition = getValidPosition(newX, newY, space.obstacles, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      const newPlayer = { ...prev, x: validPosition.x, y: validPosition.y };
      
      // Check for nearby interactable areas
      const nearby = space.interactableAreas.filter(area => {
        const areaCenter = { x: area.x + area.width / 2, y: area.y + area.height / 2 };
        const distance = calculateDistance(newPlayer, { ...newPlayer, x: areaCenter.x, y: areaCenter.y });
        return distance <= INTERACTION_DISTANCE;
      });
      setNearbyAreas(nearby);
      
      // Emit position update if player moved significantly
      if (socketRef.current && isConnected) {
        const distance = Math.sqrt(
          Math.pow(validPosition.x - lastEmittedPosition.current.x, 2) +
          Math.pow(validPosition.y - lastEmittedPosition.current.y, 2)
        );
        
        if (distance > 5) {
          socketRef.current.emit('movePlayer', newPlayer);
          lastEmittedPosition.current = { x: validPosition.x, y: validPosition.y };
        }
      }

      return newPlayer;
    });
  }, [isConnected, space.obstacles, space.interactableAreas]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with background color
    ctx.fillStyle = space.backgroundColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw obstacles
    space.obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.color;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add border for better visibility
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw interactable areas
    space.interactableAreas.forEach(area => {
      const isNearby = nearbyAreas.some(na => na.id === area.id);
      
      // Draw area background
      ctx.fillStyle = isNearby ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.1)';
      ctx.fillRect(area.x, area.y, area.width, area.height);
      
      // Draw border
      ctx.strokeStyle = isNearby ? '#3b82f6' : '#9ca3af';
      ctx.lineWidth = isNearby ? 3 : 1;
      ctx.strokeRect(area.x, area.y, area.width, area.height);
      
      // Draw label
      if (isNearby) {
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          area.label,
          area.x + area.width / 2,
          area.y + area.height / 2
        );
      }
    });

    // Draw other players
    players.forEach(player => {
      if (player.id !== currentPlayer.id) {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();

        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw player name
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, player.y - PLAYER_SIZE / 2 - 8);
      }
    });

    // Draw current player
    ctx.fillStyle = currentPlayer.color;
    ctx.beginPath();
    ctx.arc(currentPlayer.x, currentPlayer.y, PLAYER_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Add border for current player
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw current player name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentPlayer.name, currentPlayer.x, currentPlayer.y - PLAYER_SIZE / 2 - 8);
  }, [players, currentPlayer, space, nearbyAreas]);

  // Socket.IO connection
  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
      const socket = io({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        socket.emit('joinRoom', 'default', currentPlayer);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('roomState', (playersArray: Player[]) => {
        const playersMap = new Map<string, Player>();
        playersArray.forEach(player => {
          if (player.id !== currentPlayer.id) {
            playersMap.set(player.id, player);
          }
        });
        setPlayers(playersMap);
      });

      socket.on('playerJoined', (player: Player) => {
        if (player.id !== currentPlayer.id) {
          setPlayers(prev => new Map(prev.set(player.id, player)));
        }
      });

      socket.on('playerLeft', (playerId: string) => {
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.delete(playerId);
          return newPlayers;
        });
      });

      socket.on('playerMoved', (player: Player) => {
        if (player.id !== currentPlayer.id) {
          setPlayers(prev => new Map(prev.set(player.id, player)));
        }
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', 'default', currentPlayer.id);
        socketRef.current.disconnect();
      }
    };
  }, [currentPlayer.id]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      updatePlayerPosition();
      draw();
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [updatePlayerPosition, draw]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold">Gather Town Clone</h2>
        <p className="text-sm text-gray-600">Use WASD or arrow keys to move</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'} • {players.size} other player{players.size !== 1 ? 's' : ''} online
          </span>
        </div>
        {nearbyAreas.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 font-medium">Nearby Areas:</p>
            {nearbyAreas.map(area => (
              <div key={area.id} className="text-xs text-blue-600">
                {area.label} ({area.currentParticipants.length}/{area.maxParticipants})
              </div>
            ))}
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-300 rounded-lg shadow-lg"
        tabIndex={0}
      />
    </div>
  );
}