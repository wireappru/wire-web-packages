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

const values = {
  helloDecodedArray: [72, 101, 108, 108, 111],
  helloDecodedString: 'Hello',
  helloEncodedArray: [83, 71, 86, 115, 98, 71, 56, 61],
  helloEncodedString: 'SGVsbG8=',
  numberDecoded: 1337,
  numberEncoded: 'MTMzNw==',
  numberString: '1337',
};

let instance;

if (typeof window !== 'undefined') {
  instance = window;
} else {
  instance = global;
}

for (const key in values) {
  instance[key] = values[key];
}
