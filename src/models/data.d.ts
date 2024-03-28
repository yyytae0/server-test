export interface room {
	id: string;              // 방 생성자의 socket id
	roomName: string;        // 노출 방 이름
	max: number;             // 설정 최대 인원
	range: number[];         // 선택 년도
	now: number;             // 현재 참여 인원
	isPlaying: boolean;      // 현재 게임중 여부
	total: number;           // 게임에서 사용될 노래 수
	nickname: string;        // 게임을 생성한 사람의 이름
}

export interface user {
	id: string;              // socket id
	nickname: string;            // 서버 접속 시 설정 닉네임
}

export interface roomsInfo {
	[id: string]: roomInfo;  // 서버에서 보유할 방 정보 => key는 방 id
}

export interface roomInfo {
	now: number;             // 현재 플레이중인 노래 순서
	musicList: music[];      // 게임동안 사용될 음악 리스트
	players: player[];       // 게임중인 유저 목록
	max: number;
	total: number;
	range: number[];
	id: string;
	roomName: string;
}

export interface music {
	id: number;              // music id
	url: string;             // youtube id
}

export interface player {
	id: string;              // user socket id
	nickname: string;
	score: number;           // 점수
}