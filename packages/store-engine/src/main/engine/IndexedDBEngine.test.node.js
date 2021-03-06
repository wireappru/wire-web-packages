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

const {error: StoreEngineError, IndexedDBEngine} = require('@wireapp/store-engine');

describe('IndexedDBEngine', () => {
  const STORE_NAME = 'store-name';

  describe('"init"', () => {
    it('throws an error if the store is not supported by the targeted platform.', async done => {
      const storeEngine = new IndexedDBEngine();
      try {
        await storeEngine.init(STORE_NAME);
        done.fail('Expected error');
      } catch (error) {
        expect(error instanceof StoreEngineError.UnsupportedError).toBe(true);
        done();
      }
    });
  });
});
