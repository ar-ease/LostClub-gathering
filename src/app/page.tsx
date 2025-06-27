"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Game from "@/components/Game";

export default function Home() {
  const [isJoined, setIsJoined] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerId] = useState(() => uuidv4());

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setIsJoined(true);
    }
  };

  if (isJoined) {
    return <Game playerId={playerId} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Welcome to the LostClub Gathering
        </h1>
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
              maxLength={20}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
