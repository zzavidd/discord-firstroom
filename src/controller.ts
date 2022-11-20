import type { VoiceBasedChannel, VoiceState } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';
import invariant from 'tiny-invariant';

import { Client } from './client';

const TEXT_CHANNEL_ID = process.env.DISCORD_GENERAL_CHANNEL_ID!;

/**
 * Sends a message to the specified text channel about an entrance or exit of a
 * user from a public voice channel.
 * @param os The old voice channel state.
 * @param ns The new voice channel state.
 */
export async function notifyVoiceChannelEvent(
  os: VoiceState,
  ns: VoiceState,
): Promise<void> {
  try {
    invariant(os.member && ns.member, 'Member not found.');
    const userId = os.member.id;

    const message = getMessage(userId, {
      left: os.channel,
      joined: ns.channel,
    });

    const channel = Client.channels.cache.get(TEXT_CHANNEL_ID);
    invariant(channel, 'Channel does not exist.');
    if (channel.isTextBased()) {
      await channel.send(message);
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Constructs the message to send to the Discord channel.
 * @param userId The user ID.
 * @param stateCouple The couple of voice states.
 * @returns The message.
 */
function getMessage(userId: string, stateCouple: VoiceStateCouple): string {
  const { left, joined } = stateCouple;
  const isPublicChannel = (channel: VoiceBasedChannel): boolean => {
    return channel
      .permissionsFor(channel.guild.roles.everyone)
      .has(PermissionFlagsBits.ViewChannel);
  };

  let firstLine = '';
  let secondLine = '';
  let channelToSize: VoiceBasedChannel | null = null;

  if (!left && joined) {
    const isPublic = isPublicChannel(joined);
    invariant(isPublic, 'Channel is private.');
    firstLine = `<@${userId}> joined ${joined}.`;
    channelToSize = joined;
  } else if (left && !joined) {
    const isPublic = isPublicChannel(left);
    invariant(isPublic, 'Channel is private.');
    firstLine = `<@${userId}> left ${left}.`;
    channelToSize = left;
  } else if (left && joined && left !== joined) {
    if (!isPublicChannel(left)) {
      firstLine = `<@${userId}> joined ${joined}.`;
      channelToSize = joined;
    } else if (!isPublicChannel(joined)) {
      firstLine = `<@${userId}> left ${left}.`;
      channelToSize = left;
    } else {
      firstLine = `<@${userId}> left ${left} and joined ${joined}.`;
      channelToSize = joined;
    }
  } else {
    throw new Error('Invalid workflow.');
  }

  if (channelToSize) {
    const size = channelToSize.members.size;
    secondLine =
      '\nThere ' +
      (size === 1 ? 'is' : 'are') +
      ' now ' +
      (size ? `**${size}**` : 'no') +
      ' member' +
      (size === 1 ? '' : 's') +
      ' in the channel.';
  } else {
    secondLine = '';
  }

  return firstLine + secondLine;
}

interface VoiceStateCouple {
  left: VoiceBasedChannel | null;
  joined: VoiceBasedChannel | null;
}
