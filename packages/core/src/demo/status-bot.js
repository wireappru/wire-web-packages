/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

//@ts-check

const APIClient = require('@wireapp/api-client');
const {Account} = require('@wireapp/core');
const {Config} = require('@wireapp/api-client/dist/commonjs/Config');
const {MemoryEngine} = require('@wireapp/store-engine');

const {version} = require('../../package.json');

const CONVERSATION_ARGUMENT_INDEX = 2;
const conversationId = process.argv[CONVERSATION_ARGUMENT_INDEX];
if (!conversationId) {
  console.error(`Error: Conversation id is not set. Example: status-bot.js "c94a6e69-7718-406b-b834-df4144e5a65b".`);
  process.exit(1);
}

['WIRE_STATUS_BOT_EMAIL', 'WIRE_STATUS_BOT_PASSWORD'].forEach((envVar, index, array) => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable "${envVar}" is not set. Required variables: ${array.join(', ')}.`);
    process.exit(1);
  }
});

(async () => {
  const login = {
    email: process.env.WIRE_STATUS_BOT_EMAIL,
    password: process.env.WIRE_STATUS_BOT_PASSWORD,
    persist: false,
  };

  try {
    const engine = new MemoryEngine();
    await engine.init('');

    const apiClient = new APIClient(new Config(engine, APIClient.BACKEND.PRODUCTION));
    const account = new Account(apiClient);
    await account.login(login);

    await account.service.conversation.sendTextMessage(
      conversationId,
      `I am posting from @wireapp/core v${version}. 🌞`
    );
  } catch (error) {
    console.error('Error:', error);
  }
})();
