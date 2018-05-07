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
import {Availability} from '../user/root';
import {ConversationService} from '../conversation/root';

export default class AvailabilityService {
  constructor(
    private apiClient: APIClient,
    private conversationService: ConversationService,
    private protocolBuffers: any = {}
  ) {}

  private async setAvailability(clientId: string, userId: string, availability: Availability): Promise<any> {
    const messageId = new UUID(4).format();

    const availabilityMessage = this.protocolBuffers.Availability.create({
      Type: availability,
    });

    const genericMessage = this.protocolBuffers.GenericMessage.create({
      availability,
      messageId,
    });

    await this.conversationService.sendGenericMessage(clientID, conversationId, genericMessage);
    genericMessage.set(z.cryptography.GENERIC_MESSAGE_TYPE.AVAILABILITY, availabilityMessage);
  }

  public async getAvailability(userId: string): Promise<any> {}
}
