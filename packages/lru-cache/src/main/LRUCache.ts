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

interface CacheObject<T> {
  key: string | null;
  next: CacheObject<T> | null;
  previous: CacheObject<T> | null;
  value: T | null;
}

interface CacheMap<T> {
  [key: string]: CacheObject<T>;
}

class LRUCache<T> {
  private map: CacheMap<T>;
  private head: CacheObject<T> | null;
  private end: CacheObject<T> | null;

  constructor(private capacity: number = 100) {
    this.map = {};
    this.head = null;
    this.end = null;
  }

  public delete(key: string): boolean {
    let node: CacheObject<T> = this.map[key];

    if (node) {
      this.remove(node);
      delete this.map[node.key!];
      return true;
    }

    return false;
  }

  public get(key: string): T | null | void {
    let node: CacheObject<T> = this.map[key];
    if (node) {
      this.remove(node);
      this.setHead(node);
      return node.value;
    }
  }

  public keys(): Array<string> {
    let keys: Array<string> = [];
    let entry = this.head;

    while (entry) {
      keys.push(entry.key!);
      entry = entry.next;
    }

    return keys;
  }

  public latest(): T | null {
    if (!this.head) {
      throw new Error('No');
    }
    return this.head.value;
  }

  public oldest(): T | null {
    return this.end!.value;
  }

  private remove(node: CacheObject<T>): CacheObject<T> {
    if (node.previous) {
      node.previous.next = node.next;
    } else {
      this.setHead(node.next);
    }

    if (node.next != null) {
      node.next.previous = node.previous;
    } else {
      this.end = node.previous;
    }

    return node;
  }

  public set(key: string, value: T): T | null {
    let old: CacheObject<T> = this.map[key];
    let removedNode: CacheObject<T> = {
      key: null,
      next: null,
      previous: null,
      value: null,
    };

    if (old) {
      old.value = value;
      removedNode = this.remove(old);
      this.setHead(old);
      return removedNode.value;
    } else {
      let created: CacheObject<T> = {
        key: key,
        next: null,
        previous: null,
        value: value,
      };

      if (Object.keys(this.map).length >= this.capacity) {
        delete this.map[this.end!.key!];
        removedNode = this.remove(this.end!);
        this.setHead(created);
      } else {
        this.setHead(created);
      }

      this.map[key] = created;
      return removedNode.value;
    }
  }

  private setHead(node: CacheObject<T> | null) {
    if (node === null) {
      this.end = null;
      return;
    }

    node.next = this.head;
    node.previous = null;

    if (this.head) {
      this.head.previous = node;
    }

    this.head = node;

    if (this.end === null) {
      this.end = this.head;
    }
  }

  public size(): number {
    if (this.map === null) {
      return 0;
    }
    return Object.keys(this.map).length;
  }

  public toString(): string {
    let string = '(newest) ';
    let entry = this.head;

    while (entry) {
      string += `${String(entry.key)}:${entry.value}`;
      entry = entry.next;
      if (entry) {
        string += ' > ';
      }
    }

    return `${string} (oldest)`;
  }
}

export {LRUCache};
