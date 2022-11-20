import { Events } from 'discord.js';
import 'dotenv/config';

import { Client } from './client';
import * as Controller from './controller';

// Log on initial connection.
Client.once(Events.ClientReady, (bot) => {
  console.info(`Logged in as ${bot.user.tag}.`);
});

// Send a message to the text channel once somebody joins the voice channel.
Client.on(Events.VoiceStateUpdate, Controller.notifyVoiceChannelEvent);

(async () => {
  await Client.login(process.env.DISCORD_BOT_TOKEN);
})();
