import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    host: { type: 'string', short: 'h', default: 'localhost' },
    port: { type: 'string', short: 'p', default: '8031' },
  },
});

await Bun.connect({
  hostname: values.host,
  port: +values.port,
  socket: {
    data(_s, d) {
      console.log(d);
    },
    open(s) {
      setInterval(() => s.write(new Uint8Array([0x00])), 10000);
    },
  },
});
