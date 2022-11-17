import type { VoiceState } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import invariant from 'tiny-invariant';

const CHANNEL_ID = process.env.DISCORD_GENERAL_CHANNEL_ID!;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, (bot) => {
  console.info(`Logged in as ${bot.user.tag}.`);
});

client.on(Events.VoiceStateUpdate, async (os, ns) => {
  try {
    invariant(os.member && ns.member, 'Member not found.');
    const userId = os.member.id;

    let message;
    if (!os.channelId && ns.channelId) {
      message = getMessage(userId, 'joined', ns);
    } else if (os.channelId && !ns.channelId) {
      message = getMessage(userId, 'left', os);
    } else if (os.channelId && ns.channelId && os.channelId !== ns.channelId) {
      message = `<@${userId}> left <#${os.channelId}> and joined <#${ns.channelId}>.`;
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

(async () => {
  await client.login(process.env.DISCORD_BOT_TOKEN);
})();

/**
 * Constructs the message to send to the Discord channel.
 * @param userId The user ID.
 * @param verb The verb for joining or leaving.
 * @param state The voice state.
 * @returns The message.
 */
function getMessage(
  userId: string,
  verb: 'joined' | 'left',
  state: VoiceState,
): string {
  const size = state.channel?.members.size;

  const firstLine = `<@${userId}> ${verb} <#${state.channelId}>.`;
  const secondLine =
    '\nThere ' +
    (size === 1 ? 'is' : 'are') +
    ' now ' +
    (size ? `**${size}**` : 'no') +
    ' member' +
    (size === 1 ? '' : 's') +
    ' in the channel.';
  return firstLine + secondLine;
}
