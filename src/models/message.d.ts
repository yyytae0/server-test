export interface message {
  type: string;
  message: string;
}

export interface createRoomData {
  roomName: string;
  nickName: string;
  max: number;
  range: number[];
  total: number;
}

export interface joinRoomData {
  roomId: string;
  nickname: string;
}

export interface leaveRoomData {
  roomId: string;
}