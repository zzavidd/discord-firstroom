import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import invariant from 'tiny-invariant';

const CHANNEL_ID = process.env.DISCORD_GENERAL_CHANNEL_ID!;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, (bot) => {
  console.log(`Logged in as ${bot.user.tag}.`);
});

client.on(Events.VoiceStateUpdate, async (os, ns) => {
  try {
    invariant(os.member && ns.member, 'Member not found.');
    const userId = os.member.id;

    let message;
    if (!os.channel && ns.channel) {
      message = `<@${userId}> joined <#${ns.channel.id}>.`;
    } else if (os.channel && !ns.channel) {
      message = `<@${userId}> left <#${os.channel?.id}>.`;
    } else if (os.channel && ns.channel) {
      message = `<@${userId}> left <#${os.channel.id}> and joined <#${ns.channel.id}>.`;
    } else {
      throw new Error('Invalid workflow.');
    }

    const channel = client.channels.cache.get(CHANNEL_ID);
    invariant(channel, 'Channel does not exist.');
    if (channel.isTextBased()) {
      await channel.send(message);
    }
  } catch (e) {
    console.error(e);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
