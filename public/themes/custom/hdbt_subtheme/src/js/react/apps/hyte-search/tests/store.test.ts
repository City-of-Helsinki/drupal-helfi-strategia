import { beforeEach, describe, expect, it } from 'vitest';
import { createStore } from 'jotai';
import { RESET } from 'jotai/utils';
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
import { Components } from '../enum/Components';

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

  it('Derived atoms expose values from search and submitted state', () => {
    const store = createStore();
    store.set(setSearchStateAtom, {
      [Components.ADDRESS]: 'addr',
      [Components.KEYWORD]: 'kw',
      [Components.THEME]: [themeOption],
    });
    store.set(submitStateAtom);

    expect(store.get(getAddressAtom)).toBe('addr');
    expect(store.get(getKeywordAtom)).toBe('kw');
    expect(store.get(getThemeAtom)).toHaveLength(1);
    expect(store.get(getPageAtom)).toBe(1);
  });
});
