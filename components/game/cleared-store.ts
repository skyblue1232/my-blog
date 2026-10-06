'use client';

import { useSyncExternalStore } from 'react';

/**
 * 끝까지 읽은 글(= CLEAR한 퀘스트)을 브라우저에 기록합니다.
 * 서버나 다른 기기와 동기화하지 않는 개인 진행 기록이며, 저장소를 쓸 수 없는 환경에서는 조용히 빈 값으로 동작합니다.
 */
const KEY = 'lab:cleared';
const EVENT = 'lab:cleared-change';
const EMPTY: readonly string[] = [];

let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function markCleared(slug: string) {
  const current = read();
  if (current.includes(slug)) return false;
  cache = [...current, slug];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // 저장소를 쓸 수 없어도 현재 세션에서는 반영합니다.
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export function useCleared() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
