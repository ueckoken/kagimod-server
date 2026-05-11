import { type Socket, type TCPSocketListener } from 'bun';
import { getDB } from '$lib/server/database';
import { sendLog } from '$lib/server/discord';

type SocketData = {
  queue: Uint8Array[];
  lastPingAt: number;
  recvBuf: Uint8Array;
  recvLen: number;
};

let server: TCPSocketListener | null = null;
const clients: Set<Socket<SocketData>> = new Set();

function flush(socket: Socket<SocketData>) {
  const { queue } = socket.data;
  while (queue.length > 0) {
    const data = queue[0];
    const written = socket.write(data);
    if (written < data.byteLength) {
      queue[0] = data.subarray(written);
      return;
    }
    queue.shift();
  }
}

function enqueue(socket: Socket<SocketData>, data: Uint8Array) {
  socket.data.queue.push(data);
  if (socket.data.queue.length === 1) {
    flush(socket);
  }
}

function broadcast(data: Uint8Array) {
  for (const socket of clients) {
    enqueue(socket, data);
  }
}

function recvData(socket: Socket<SocketData>, data: Uint8Array) {
  socket.data.recvLen = 0;
  let i = 0;
  while (i < data.byteLength) {
    const d = data.subarray(i);
    if (d[0] == 0x00) {
      socket.data.lastPingAt = Date.now();
      enqueue(socket, new Uint8Array([0x00]));
      i++;
    } else if (d[0] === 0x01) {
      sendLog(true, '');
      i++;
    } else if (d[0] === 0x02) {
      sendLog(false, '');
      i++;
    } else if (d[0] === 0x03 || d[0] === 0x04) {
      if (d.byteLength >= 9) {
        if (d[0] === 0x03) {
          sendLog(true, d.subarray(1, 9).toHex());
        } else {
          sendLog(false, d.subarray(1, 9).toHex());
        }
        i += 9;
      } else {
        socket.data.recvBuf.set(d);
        socket.data.recvLen = d.byteLength;
        break;
      }
    } else {
      socket.end();
    }
  }
}

export function startTCPServer() {
  if (server) return;
  server = Bun.listen<SocketData>({
    hostname: '0.0.0.0',
    port: 3001,
    socket: {
      open(socket) {
        socket.data = { 
          queue: [],
          lastPingAt: Date.now(),
          recvBuf: new Uint8Array(8),
          recvLen: 0,
        };
        clients.add(socket);

        const idmHashList = getDB().query('SELECT cards.idm_hash FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1').all().map(a => (a as { idm_hash: string }).idm_hash);
        const length = idmHashList.length;
        const data = new Uint8Array(3 + length * 8);
        data.set([0x01]);
        data.subarray(1).set([(length >> 8) & 0xff, length & 0xff]);
        data.subarray(3).setFromHex(idmHashList.join(''));
        enqueue(socket, data);
      },
      drain(socket) {
        flush(socket);
      },
      data(socket, buff) {
        const { recvBuf, recvLen } = socket.data;
        const data = new Uint8Array(recvLen + buff.byteLength);
        data.set(recvBuf.subarray(0, recvLen));
        data.subarray(recvLen).set(buff);
        recvData(socket, data);
      },
      close(socket) {
        clients.delete(socket);
      },
    },
  });

  setInterval(() => {
    for (const socket of clients) {
      if (Date.now() - socket.data.lastPingAt > 30000) socket.end();
    }
  }, 30000);
}

export function update() {
  const idmHashList = getDB().query('SELECT cards.idm_hash FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1').all().map(a => (a as { idm_hash: string }).idm_hash);
  const length = idmHashList.length;
  const data = new Uint8Array(3 + length * 8);
  data.set([0x01]);
  data.subarray(1).set([(length >> 8) & 0xff, length & 0xff]);
  data.subarray(3).setFromHex(idmHashList.join(''));
  broadcast(data);
}

export function insert(idm_hash: string) {
  const card = getDB().query('SELECT cards.idm_hash FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1 AND cards.idm_hash = ?').get(idm_hash) as { idm_hash: string };
  if (card) {
    const data = new Uint8Array(9);
    data.set([0x02]);
    data.subarray(1).setFromHex(idm_hash);
    broadcast(data);
  }
}

export function delete_(idm_hash: string) {
  const data = new Uint8Array(9);
  data.set([0x03]);
  data.subarray(1).setFromHex(idm_hash);
  broadcast(data);
}
