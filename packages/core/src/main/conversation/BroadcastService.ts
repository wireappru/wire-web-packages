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

const UUID = require('pure-uuid');
import APIClient = require('@wireapp/api-client');
import {PriorityQueue} from '@wireapp/priority-queue';
import {AxiosError} from 'axios';
import {
  ClientMismatch,
  NewOTRMessage,
  OTRRecipients,
  UserClients,
} from '@wireapp/api-client/dist/commonjs/conversation/index';
import {CryptographyService, EncryptedAsset} from '../cryptography/root';
import {ConversationService} from '../conversation/root';
import {AssetService, ConfirmationType, Image, RemoteData} from '../conversation/root';

export default class BroadcastService {
  private sendingQueue: PriorityQueue;

  constructor(
    private apiClient: APIClient,
    private conversationService: ConversationService,
    private protocolBuffers: any = {},
    private cryptographyService: CryptographyService,
    private assetService: AssetService
  ) {
    this.sendingQueue = new PriorityQueue();
  }

  public async sendBroadcast(
    sendingClientId: string,
    conversationId: string,
    genericMessage: any
  ): Promise<ClientMismatch> {
    this.sendingQueue.add(() => {
      const plainTextBuffer: Buffer = this.protocolBuffers.GenericMessage.encode(genericMessage).finish();
      const preKeyBundles = await this.getPreKeyBundles(conversationId);
      const recipients = await this.cryptographyService.encrypt(plainTextBuffer, <UserPreKeyBundleMap>preKeyBundles);

      return this.sendMessage(sendingClientId, conversationId, recipients);
    });
  }

  private async createBroadcastRecipients(genericMessage: any): Promise<any> {
    const recipients = {};

    for (const userEntity of this.userRepository.teamUsers().concat(this.userRepository.self())) {
      recipients[userEntity.id] = userEntity.devices().map(clientEntity => clientEntity.id);
    }

    return recipients;
  }
}
