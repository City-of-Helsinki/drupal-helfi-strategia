import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'jotai';
import { RESET } from 'jotai/utils';
import { Components } from '../enum/Components';
import {
  getAddressAtom,
  getKeywordAtom,
  getPageAtom,
  getThemeAtom,
  searchStateAtom,
  setPageAtom,
  setSearchStateAtom,
  submitStateAtom,
  submittedStateAtom,
} from '../store';

// Service map response used when an address is resolved to coordinates.
const serviceMapResponse = {
  results: [{ location: { coordinates: [24.9354, 60.1695] }, name: { fi: 'Mannerheimintie 1' } }],
};

const mockServiceMap = (response: unknown = { results: [] }) => {
  const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(response) }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const themeOption = {
  disabled: false,
  isGroupLabel: false,
  label: 'Culture',
  selected: true,
  value: 'hh_kul',
  visible: true,
};

describe('store.ts', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    // Keep address resolution off the network by default.
    mockServiceMap();
  });

  it('setSearchStateAtom merges partial updates into searchStateAtom', () => {
    const store = createStore();
    store.set(setSearchStateAtom, { [Components.KEYWORD]: 'first' });
    store.set(setSearchStateAtom, { [Components.ADDRESS]: 'second' });
    const state = store.get(searchStateAtom);
    expect(state[Components.KEYWORD]).toBe('first');
    expect(state[Components.ADDRESS]).toBe('second');
  });

  it('setSearchStateAtom with RESET clears both states and the URL', () => {
    const store = createStore();
    store.set(setSearchStateAtom, { [Components.KEYWORD]: 'sk' });
    store.set(submitStateAtom);
    expect(window.location.search).toContain('keyword=sk');

    store.set(setSearchStateAtom, RESET);
    expect(store.get(searchStateAtom)).toEqual({ page: 1 });
    expect(store.get(submittedStateAtom)).toEqual({ page: 1 });
    expect(window.location.search).toBe('');
  });

  it('submitStateAtom copies search state to submitted state and writes URL params', () => {
    const store = createStore();
    store.set(setSearchStateAtom, {
      [Components.KEYWORD]: 'sk',
      [Components.THEME]: [themeOption],
    });
    store.set(submitStateAtom);

    const submitted = store.get(submittedStateAtom);
    expect(submitted[Components.KEYWORD]).toBe('sk');
    expect(submitted[Components.THEME]).toHaveLength(1);
    expect(window.location.search).toContain('keyword=sk');
    expect(window.location.search).toContain('theme=hh_kul');
  });

  it('setPageAtom updates the submitted page and the URL', () => {
    const store = createStore();
    store.set(setPageAtom, 3);
    expect(store.get(submittedStateAtom)[Components.PAGE]).toBe(3);
    expect(window.location.search).toContain('page=3');
  });

  it('submitStateAtom resolves coordinates for the submitted address', async () => {
    const fetchMock = mockServiceMap(serviceMapResponse);
    const store = createStore();
    store.set(setSearchStateAtom, { [Components.ADDRESS]: 'Mannerheimintie 1' });
    await store.set(submitStateAtom);

    // Without coordinates the geo filter is skipped and no search is made at all, so
    // they must be resolved even when the address never went through onSubmit.
    expect(store.get(submittedStateAtom).addressWithCoordinates).toEqual({
      label: 'Mannerheimintie 1',
      value: [24.9354, 60.1695, 'Mannerheimintie 1'],
    });

    // Resubmitting the same address reuses what was already resolved.
    const callCount = fetchMock.mock.calls.length;
    await store.set(submitStateAtom);
    expect(fetchMock.mock.calls.length).toBe(callCount);
  });

  it('submitStateAtom clears coordinates that no longer match the address', async () => {
    mockServiceMap(serviceMapResponse);
    const store = createStore();
    store.set(setSearchStateAtom, { [Components.ADDRESS]: 'Mannerheimintie 1' });
    await store.set(submitStateAtom);

    mockServiceMap();
    store.set(setSearchStateAtom, { [Components.ADDRESS]: '' });
    await store.set(submitStateAtom);

    expect(store.get(submittedStateAtom).addressWithCoordinates).toBeUndefined();
  });

  it('Derived atoms expose values from search and submitted state', async () => {
    const store = createStore();
    store.set(setSearchStateAtom, {
      [Components.ADDRESS]: 'addr',
      [Components.KEYWORD]: 'kw',
      [Components.THEME]: [themeOption],
    });
    await store.set(submitStateAtom);

    expect(store.get(getAddressAtom)).toBe('addr');
    expect(store.get(getKeywordAtom)).toBe('kw');
    expect(store.get(getThemeAtom)).toHaveLength(1);
    expect(store.get(getPageAtom)).toBe(1);
  });
});
