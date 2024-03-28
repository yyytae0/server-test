import http from "http";
import { Server } from "socket.io";
import { room, user, player, roomInfo, roomsInfo, music } from "./models/data";
import { createRoomData, joinRoomData, leaveRoomData } from "./models/message";

const interval = 3000;

let rooms: room[] = [];
let users: user[] = [];
let roomsInfo: roomsInfo = {};
let roomsMusic: {[roomId: string]: []} = {};

const socket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("login", (data) => {
      if (users.some((user) => user.id === socket.id)) return;
      users.push({
        id: socket.id,
        ...data,
      });
      socket.join("wait");
      socket.leave(socket.id);
      socket.emit("getRooms", rooms);
    });

    socket.on("disconnect", () => {
      users = users.filter((user) => user.id !== socket.id);
    });

    socket.on("createRoom", (data: createRoomData) => {
      rooms.push({
        id: socket.id,
        now: 1,
        isPlaying: false,
        roomName: data.roomName,
        max: data.max,
        range: data.range,
        total: data.total,
        nickname: data.nickname
      });
      roomsInfo[socket.id] = {
        now: 0,
        musicList: [],
        players: [{
          id: socket.id,
          nickname: data.nickname,
          score: 0
        }],
        max: data.max,
        total: data.total,
        range: data.range,
        id: socket.id,
        roomName: data.roomName
      };
      socket.join(socket.id);
      socket.leave("wait");
      io.to(socket.id).emit('getRoomDetail', roomsInfo[socket.id]);
      io.to("wait").emit("getRooms", rooms);
    });

    socket.on("joinRoom", (data: joinRoomData) => {
      if (roomsInfo[data.roomId].max <= roomsInfo[data.roomId].players.length + 1) {
        socket.emit('fullRoomAlert')
        return
      }
      socket.join(data.roomId);
      socket.leave('wait');
      roomsInfo[data.roomId].players.push({
        id: socket.id,
        nickname: data.nickname,
        score: 0
      })
      roomsInfo[data.roomId] = {
        ...roomsInfo[data.roomId]
      }
      const roomIdx = rooms.findIndex((room) => room.id === data.roomId);
      rooms[roomIdx].now += 1;
      io.to('wait').emit('getRooms', rooms);
      io.to(data.roomId).emit('getRoomDetail', roomsInfo[data.roomId])
    });

    socket.on("leaveRoom", (data: leaveRoomData) => {
      socket.leave(data.roomId);
      const clients = io.sockets.adapter.rooms.get(data.roomId);
      socket.join("wait");
      if (!clients) {
        rooms = rooms.filter((item) => {
          return item.id !== data.roomId;
        });
        io.to("wait").emit("getRooms", rooms);
      } else {
        roomsInfo[data.roomId].players = roomsInfo[data.roomId].players.filter((player) => player.id !== socket.id);
        socket.to(data.roomId).emit('getRoomDetail', roomsInfo[data.roomId]);
        const roomIdx = rooms.findIndex((room) => room.id === data.roomId);
        rooms[roomIdx].now -= 1;
        socket.to('wait').emit("getRooms", rooms);
      }
    });

    socket.on('disconnecting', () => {
      users = users.filter((user) => user.id !== socket.id);
      const roomId = [...socket.rooms][0]
      if (!roomsInfo[roomId]) return
      roomsInfo[roomId].players = roomsInfo[roomId].players.filter((player) => player.id !== socket.id);
      if (roomsInfo[roomId].players.length === 0 ) {
        rooms = rooms.filter((item) => {
          return item.id !== roomId;
        });
        io.to("wait").emit("getRooms", rooms);
        return
      }
      socket.to(roomId).emit('getRoomDetail', roomsInfo[roomId]);
      const roomIdx = rooms.findIndex((room) => room.id === roomId);
      rooms[roomIdx].now -= 1;
      socket.to('wait').emit("getRooms", rooms);
    })
  });
};

export default socket;
