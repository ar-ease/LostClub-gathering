import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Player, Room } from '@/types/game';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

const rooms = new Map<string, Room>();

export const initializeSocket = (server: NetServer) => {
  const io = new ServerIO(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('joinRoom', (roomId: string, player: Player) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          name: `Room ${roomId}`,
          players: new Map(),
          maxPlayers: 50,
        });
      }

      const room = rooms.get(roomId)!;
      room.players.set(player.id, player);

      socket.broadcast.to(roomId).emit('playerJoined', player);
      
      const playersArray = Array.from(room.players.values());
      socket.emit('roomState', playersArray);

      console.log(`Player ${player.name} joined room ${roomId}`);
    });

    socket.on('leaveRoom', (roomId: string, playerId: string) => {
      socket.leave(roomId);
      
      const room = rooms.get(roomId);
      if (room) {
        room.players.delete(playerId);
        socket.broadcast.to(roomId).emit('playerLeft', playerId);
        
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }

      console.log(`Player ${playerId} left room ${roomId}`);
    });

    socket.on('movePlayer', (player: Player) => {
      const roomId = Array.from(socket.rooms).find(room => room !== socket.id);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room && room.players.has(player.id)) {
          room.players.set(player.id, player);
          socket.broadcast.to(roomId).emit('playerMoved', player);
        }
      }
    });

    socket.on('disconnect', () => {
      const roomId = Array.from(socket.rooms).find(room => room !== socket.id);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          const playerToRemove = Array.from(room.players.values()).find(
            p => p.id === socket.id
          );
          if (playerToRemove) {
            room.players.delete(playerToRemove.id);
            socket.broadcast.to(roomId).emit('playerLeft', playerToRemove.id);
            
            if (room.players.size === 0) {
              rooms.delete(roomId);
            }
          }
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};