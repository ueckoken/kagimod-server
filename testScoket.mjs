import { parseArgs } from 'util';

const { values } = parseArgs({
  args: Bun.argv,
  oprions: {
    host: { type: 'string', short: 'h' },
    port: { type: 'number', short: 'p' },
  },
  allowPositionals: true,
});

await Bun.connect({
  hostname: values.host || 'localhost',
  port: values.port || 8031,
  socket: {
    data(_s, d) {
      console.log(d);
    },
    open(s) {
      setInterval(() => s.write(new Uint8Array([0x00])), 10000);
    },
  },
});
