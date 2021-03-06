/* eslint-disable no-magic-numbers */
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

const nock = require('nock');

const Client = require('@wireapp/api-client/dist/commonjs/Client');
const {AUTH_TABLE_NAME, AuthAPI} = require('@wireapp/api-client/dist/commonjs/auth/');
const {UserAPI} = require('@wireapp/api-client/dist/commonjs/user/');
const {MemoryEngine} = require('@wireapp/store-engine');

describe('Client', () => {
  const baseURL = Client.BACKEND.PRODUCTION.rest;

  let accessTokenData = {
    access_token:
      'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
    expires_in: 900,
    token_type: 'Bearer',
    user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
  };

  describe('"constructor"', () => {
    it('constructs a client with production backend and StoreEngine by default', () => {
      const client = new Client();
      expect(client.transport.http.baseURL).toBe(Client.BACKEND.PRODUCTION.rest);
      expect(client.transport.ws.baseURL).toBe(Client.BACKEND.PRODUCTION.ws);
    });

    it('constructs StoreEngine when only the URLs is provided', () => {
      const client = new Client({urls: Client.BACKEND.PRODUCTION});
      expect(client.transport.http.baseURL).toBe(Client.BACKEND.PRODUCTION.rest);
      expect(client.transport.ws.baseURL).toBe(Client.BACKEND.PRODUCTION.ws);
    });

    it('constructs URLs when only the StoreEngine is provided', () => {
      const client = new Client({store: new MemoryEngine()});
      expect(client.transport.http.baseURL).toBe(Client.BACKEND.PRODUCTION.rest);
      expect(client.transport.ws.baseURL).toBe(Client.BACKEND.PRODUCTION.ws);
    });

    it('constructs schema callback when provided', () => {
      const schemaCallback = db => {
        db.version(1).stores({
          [AUTH_TABLE_NAME]: '',
        });
      };
      const client = new Client({
        schemaCallback,
        store: new MemoryEngine(),
      });
      expect(client.config.schemaCallback).toBe(schemaCallback);
    });
  });

  describe('"login"', () => {
    accessTokenData = {
      access_token:
        'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
      expires_in: 900,
      token_type: 'Bearer',
      user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
    };

    const loginData = {
      email: 'me@mail.com',
      password: 'top-secret',
      persist: false,
    };

    const userData = [
      {
        accent_id: 0,
        assets: [],
        handle: 'webappbot',
        id: '062418ea-9b93-4d93-b59b-11aba3f702d8',
        name: 'Webapp Bot',
        picture: [
          {
            content_length: 7023,
            content_type: 'image/jpeg',
            data: null,
            id: 'bb5c861e-b133-46e1-a92b-555218ecdf52',
            info: {
              correlation_id: '83f6d538-fc38-4e24-97ae-312f079f3594',
              height: 280,
              nonce: '83f6d538-fc38-4e24-97ae-312f079f3594',
              original_height: 1080,
              original_width: 1920,
              public: true,
              tag: 'smallProfile',
              width: 280,
            },
          },
          {
            content_length: 94027,
            content_type: 'image/jpeg',
            data: null,
            id: 'efd732aa-2ff2-4959-968a-a621dda342b6',
            info: {
              correlation_id: '83f6d538-fc38-4e24-97ae-312f079f3594',
              height: 1080,
              nonce: '83f6d538-fc38-4e24-97ae-312f079f3594',
              original_height: 1080,
              original_width: 1920,
              public: true,
              tag: 'medium',
              width: 1920,
            },
          },
        ],
      },
    ];

    beforeEach(() => {
      nock(baseURL)
        .post(`${AuthAPI.URL.LOGIN}`, {
          email: loginData.email,
          password: loginData.password,
        })
        .query({persist: loginData.persist})
        .reply(200, accessTokenData);

      nock(baseURL)
        .post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`)
        .reply(200, undefined);
    });

    it('creates a context from a successful login', done => {
      const client = new Client();
      client.login(loginData).then(context => {
        expect(context.userId).toBe(accessTokenData.user);
        expect(client.accessTokenStore.accessToken.access_token).toBe(accessTokenData.access_token);
        done();
      });
    });

    it('can login after a logout', done => {
      const client = new Client();
      client
        .login(loginData)
        .then(() => client.logout())
        .then(done)
        .catch(done.fail);
    });

    it('refreshes an access token when it gets invalid', done => {
      nock(baseURL)
        .get(UserAPI.URL.USERS)
        .query({handles: 'webappbot'})
        .once()
        .reply(401, undefined);

      nock(baseURL)
        .get(UserAPI.URL.USERS)
        .query({handles: 'webappbot'})
        .twice()
        .reply(200, userData);

      nock(baseURL)
        .post(AuthAPI.URL.ACCESS)
        .reply(200, accessTokenData);

      const client = new Client();
      client
        .login(loginData)
        .then(context => {
          expect(context.userId).toBe(accessTokenData.user);
          // Overwrite access token
          client.accessTokenStore.accessToken.access_token = undefined;
          // Make a backend call
          return client.user.api.getUsers({handles: ['webappbot']});
        })
        .then(response => {
          expect(response.name).toBe(userData.name);
          expect(client.accessTokenStore.accessToken.access_token).toBeDefined();
          done();
        })
        .catch(done.fail);
    });
  });

  describe('"logout"', () => {
    beforeEach(() => {
      nock(baseURL)
        .post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`)
        .reply(200, undefined);
    });

    it('can logout a user', async done => {
      const client = new Client();

      const context = client.createContext(
        '3721e5d3-558d-45ac-b476-b4a64a8f74c1',
        'dce3d529-51e6-40c2-9147-e091eef48e73',
        'temporary'
      );
      await client.initEngine(context);

      try {
        await client.logout();
        done();
      } catch (error) {
        done.fail(error);
      }
    });
  });

  describe('"register"', () => {
    const registerData = {
      accent_id: 0,
      assets: [],
      email: 'user@wire.com',
      id: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
      locale: 'de',
      name: 'unique_username',
      picture: [],
    };

    beforeEach(() => {
      nock(baseURL)
        .post(AuthAPI.URL.REGISTER, registerData)
        .reply(200, registerData);

      nock(baseURL)
        .post(AuthAPI.URL.ACCESS)
        .reply(200, accessTokenData);
    });

    it('automatically gets an access token after registration', done => {
      const client = new Client({
        schemaCallback: db => {
          db.version(1).stores({
            [AUTH_TABLE_NAME]: '',
          });
        },
      });
      client
        .register(registerData)
        .then(context => {
          expect(context.userId).toBe(registerData.id);
          expect(client.accessTokenStore.accessToken.access_token).toBe(accessTokenData.access_token);
          done();
        })
        .catch(done.fail);
    });
  });
});
