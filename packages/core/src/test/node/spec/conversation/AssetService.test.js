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

/* eslint-disable no-magic-numbers */
const APIClient = require('@wireapp/api-client');
const UUID = require('pure-uuid');
const {Account} = require('@wireapp/core');
const {MemoryEngine} = require('@wireapp/store-engine');

describe('AssetService', () => {
  let account;

  beforeAll(async done => {
    const engine = new MemoryEngine();
    await engine.init('');

    const client = new APIClient({store: engine, urls: APIClient.BACKEND.STAGING});
    account = new Account(client);
    await account.init();

    done();
  });

  describe('"uploadImageAsset"', () => {
    it('builds protocol buffers', async done => {
      const assetServerData = {
        key: `3-2-${new UUID(4).format()}`,
        keyBytes: Buffer.from(new UUID(4).format()),
        sha256: new UUID(4).format(),
        token: new UUID(4).format(),
      };

      const assetService = account.service.conversation.assetService;
      const image = {
        data: Buffer.from([1, 2, 3]),
        height: 600,
        type: 'image/png',
        width: 600,
      };

      spyOn(assetService, 'postAsset').and.returnValue(Promise.resolve(assetServerData));

      const asset = await assetService.uploadImageAsset(image);

      expect(asset.original).toEqual(
        jasmine.objectContaining({
          mimeType: image.type,
          size: image.data.length,
        })
      );

      expect(asset.original.image).toEqual(
        jasmine.objectContaining({
          height: image.height,
          width: image.width,
        })
      );

      expect(asset.uploaded).toEqual(
        jasmine.objectContaining({
          assetId: assetServerData.key,
          assetToken: assetServerData.token,
          otrKey: assetServerData.keyBytes,
          sha256: assetServerData.sha256,
        })
      );

      done();
    });
  });
});
