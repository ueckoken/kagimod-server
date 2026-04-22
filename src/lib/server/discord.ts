import { 
  Client, Events, GatewayIntentBits,
} from 'discord.js';
import { DISCORD_TOKEN, API_ROLES } from '$env/static/private';
import { getDB } from '$lib/server/database';

let guildId: string = '';
let roles: string[] = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

async function fetchRoles() {
  try {
    const res = await fetch(API_ROLES);
    const data = await res.json();
    guildId = data.guildId;
    roles = data.roles;
  } catch(e) {
    console.error(e);
  }
}

async function fullSync() {
  await fetchRoles();
  const db = getDB();
  const users = db.query('SELECT discord_id, active FROM users').all();
  const guild = await client.guilds.fetch(guildId);
  const members = await guild.members.fetch();
  for (const user of users as { discord_id: string, active: number }[]) {
    const member = members.get(user.discord_id);
    if (member) {
      const active = member.roles.cache.hasAny(...roles) ? 1 : 0;
      if (user.active != active) {
        db.query('UPDATE users SET username = ?1, active = ?2 WHERE discord_id == ?3').run(member.user.username, active, member.id);
      }
    }
  }
}

export async function addUser(userId: string) {
  await fetchRoles();
  const db = getDB();
  const dbUser = db.query('SELECT * FROM users WHERE discord_id == ?').get(userId);
  if (dbUser) return;
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(userId);
  const active = member.roles.cache.hasAny(...roles) ? 1 : 0;
  db.query('INSERT INTO users (discord_id, username, active) VALUES (?1, ?2, ?3)').run(member.id, member.user.username, active);
}

export async function login() {
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`);
  });

  client.on(Events.ShardReady, async () => {
    console.log('shardReady');
    fullSync();
  });

  client.on(Events.ShardResume, async () => {
    console.log('shardResume');
    fullSync();
  });

  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    await fetchRoles();
    const oldActive = oldMember.roles.cache.hasAny(...roles) ? 1 : 0;
    const newActive = newMember.roles.cache.hasAny(...roles) ? 1 : 0;
    if (oldActive != newActive) {
      getDB().query('UPDATE users SET username = ?1, active = ?2 WHERE discord_id == ?3').run(newMember.user.username, newActive, newMember.id);
    }
  });

  await client.login(DISCORD_TOKEN);
}
