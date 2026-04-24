import { 
  Client, Events, GatewayIntentBits, EmbedBuilder
} from 'discord.js';
import { DISCORD_TOKEN, DISCORD_CHANNEL, API_ROLES } from '$env/static/private';
import { getDB } from '$lib/server/database';
import { updateEvent } from '$lib/server/sse';

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
  const users = db.query('SELECT discord_id, active FROM users').all() as { discord_id: string, active: number }[];
  const cardsUsers = db.query('SELECT user_id FROM cards').all() as { user_id: string }[];
  const guild = await client.guilds.fetch(guildId);
  const members = await guild.members.fetch();
  let update = false;
  for (const cardsUser of cardsUsers) {
    const member = members.get(cardsUser.user_id);
    if (member) {
      const active = member.roles.cache.hasAny(...roles) ? 1 : 0;
      const user = users.filter(u => u.discord_id == member.id)[0];
      if (user) {
        if (user.active != active) {
          db.query('UPDATE users SET username = ?1, active = ?2 WHERE discord_id = ?3').run(member.user.username, active, member.id);
          update = true;
        }
      } else {
        db.query('INSERT INTO users (discord_id, username, active) VALUES (?1, ?2, ?3)').run(member.id, member.user.username, active);
        update = true;
      }
    }
  }
  if (update) {
    updateEvent();
  }
}

export async function sendLog(open: boolean, idm_hash: string) {
  console.log(open ? 'open' : 'close', idm_hash);
  const getDescription = (s: string) => `**工研部室** は ${s} で${open ? '解錠' : '施錠'}された`;
  let description = '';
  if (idm_hash) {
    const card = getDB().query('SELECT users.username, cards.label FROM cards INNER JOIN users ON cards.user_id = users.discord_id WHERE users.active = 1 AND cards.idm_hash = ?').get(idm_hash) as { username: string, label: string };
    if (card) {
      description = getDescription(`**${card.username}** の **${card.label}**`);
      const overflow = description.length - 4096;
      if (overflow > 0) {
        description = getDescription(`**${card.username}** の **${card.label.slice(0, -overflow - 1)}…**`);
      }
    } else {
      description = getDescription('***Unknown***');
    }
  } else {
    description = getDescription('**物理鍵**');
  }
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setTimestamp()
    .setColor(open ? '#00ff00' : '#ff0000'); 
  const channel = await client.channels.fetch(DISCORD_CHANNEL);
  if (channel?.isSendable()) {
    await channel.send({ embeds: [embed] });
  }
}

export async function addUser(userId: string) {
  await fetchRoles();
  const db = getDB();
  const dbUser = db.query('SELECT * FROM users WHERE discord_id = ?').get(userId);
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
      getDB().query('UPDATE users SET username = ?1, active = ?2 WHERE discord_id = ?3').run(newMember.user.username, newActive, newMember.id);
      updateEvent();
    }
  });

  await client.login(DISCORD_TOKEN);
}
