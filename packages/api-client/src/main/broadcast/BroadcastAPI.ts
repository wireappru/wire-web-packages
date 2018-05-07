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

import {AxiosRequestConfig} from 'axios';
import {HttpClient} from '../http/';
import {Broadcast} from '../broadcast';

class BroadcastAPI {
  constructor(private client: HttpClient) {}

  static readonly URL = {
    BROADCAST: '/broadcast',
  };

  /**
   * Remove bot from conversation.
   * @param broadcastData Payload to be posted
   * @param preconditionOption Level that backend checks for missing clients
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/postOtrBroadcast_0
   */
  public postBroadcastMessage(broadcastData: Broadcast, preconditionOption?: Array<string> | boolean): Promise<{}> {
    const config: AxiosRequestConfig = {
      method: 'post',
      params: {},
      url: `${BroadcastAPI.URL.BROADCAST}/otr/messages`,
    };

    if (preconditionOption instanceof Array && Array.length) {
      config.params.report_missing = preconditionOption.join(',');
    } else if (preconditionOption) {
      config.params.ignore_missing = 'true';
    }

    return this.client.sendJSON(config).then(() => ({}));
  }
}

export {BroadcastAPI};
