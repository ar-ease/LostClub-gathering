import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/lib/socket";
import { initializeSocket } from "@/lib/socket";

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (!res.socket.server.io) {
    console.log("Setting up socket server...");
    const io = initializeSocket(res.socket.server);
    res.socket.server.io = io;
  }
  res.end();
}

