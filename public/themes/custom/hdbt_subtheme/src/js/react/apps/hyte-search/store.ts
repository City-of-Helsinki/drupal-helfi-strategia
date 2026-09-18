import type { estypes } from '@elastic/elasticsearch';
import type { Option } from 'hds-react';
import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import type { AddressWithCoordinates } from '@/react/common/AddressSearch';
import type { AddressSearchErrorType } from '@/react/common/helpers/addressSearchError';
import {
  type AddressCoordinates,
  getAddressCoordinates,
  ServiceMapUnavailableError,
} from '@/react/common/helpers/ServiceMap';
import { Components } from './enum/Components';
import { Themes } from './enum/Themes';

declare const ELASTIC_DEV_URL: string | undefined;

type aggsType = { [key: string]: estypes.AggregationsStringTermsBucket[] } | undefined;
export const aggsAtom = atom<aggsType>(undefined);

export type SearchState = {
  [Components.ADDRESS]?: string;
  [Components.KEYWORD]?: string;
  [Components.PAGE]?: number;
  [Components.THEME]?: Option[];
  addressWithCoordinates?: AddressWithCoordinates;
  addressError?: AddressSearchErrorType;
};

const urlParams = new URLSearchParams(window.location.search);
const initialParams: SearchState = {
  [Components.ADDRESS]: urlParams.get(Components.ADDRESS) || '',
  [Components.KEYWORD]: urlParams.get(Components.KEYWORD) || '',
  [Components.PAGE]: Number(urlParams.get(Components.PAGE)) || 1,
  [Components.THEME]: urlParams
    .getAll(Components.THEME)
    .map((value) => ({ label: Themes.get(value), value }) as Option),
};

/**
 * Converts the current search state to URL search parameters.
 *
 * @param {Object} currentParams - The current search state.
 * @returns {URLSearchParams} - The URL search parameters representing the current search state.
 */
const selectionsToURLParams = (currentParams: SearchState): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(currentParams)
    .filter(([key]) => key !== 'addressWithCoordinates' && key !== 'addressError')
    .forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length) {
        value.forEach((option) => {
          params.append(key, option.value);
        });
      } else if (value && !Array.isArray(value)) {
        params.set(key, value.toString());
      }
    });

  return params;
};

const setUrlParams = (params: URLSearchParams) => {
  const url = new URL(window.location.toString());
  url.search = params.toString();
  window.history.replaceState({}, '', url.toString());
};

type ResolvedAddress = { address?: AddressWithCoordinates; error?: AddressSearchErrorType };

/**
 * Resolves the coordinates the geo filter needs from an address string.
 *
 * @param {string|undefined} address - The address to resolve.
 * @returns {Promise} - Promise resolving to the address with coordinates, or to the
 *   reason it could not be resolved: `not-found` when the service map does not
 *   recognize the address, `unavailable` when it could not be reached at all.
 *   Both are empty when there is no address to resolve.
 */
const resolveAddress = async (address?: string): Promise<ResolvedAddress> => {
  if (!address) {
    return {};
  }

  let coordinates: AddressCoordinates | null;

  try {
    coordinates = await getAddressCoordinates(address);
  } catch (e) {
    if (!(e instanceof ServiceMapUnavailableError)) {
      throw e;
    }

    return { error: 'unavailable' };
  }

  return coordinates ? { address: { label: address, value: coordinates } } : { error: 'not-found' };
};

export const searchStateAtom = atomWithReset<SearchState>({ page: 1 });
export const submittedStateAtom = atomWithReset<SearchState>({ page: 1 });
export const submitStateAtom = atom(null, async (get, set) => {
  const currentState = { ...get(searchStateAtom) };
  const address = currentState[Components.ADDRESS];

  if (currentState.addressWithCoordinates?.label !== address) {
    const resolved = await resolveAddress(address);
    currentState.addressWithCoordinates = resolved.address;
    currentState.addressError = resolved.error;
  }

  set(searchStateAtom, currentState);
  set(submittedStateAtom, currentState);
  setUrlParams(selectionsToURLParams(currentState));
});

export const initializeAppAtom = atom(null, async (_get, set, aggs: aggsType) => {
  set(aggsAtom, aggs);

  const resolved = await resolveAddress(initialParams[Components.ADDRESS]);

  if (resolved.address) {
    initialParams.addressWithCoordinates = resolved.address;
  }

  if (resolved.error) {
    initialParams.addressError = resolved.error;
  }

  set(searchStateAtom, { ...initialParams });
  set(submittedStateAtom, { ...initialParams });
  set(initializedAtom, true);
});

export const setSearchStateAtom = atom(null, (get, set, update: Partial<SearchState> | typeof RESET) => {
  if (update === RESET) {
    set(searchStateAtom, RESET);
    set(submittedStateAtom, RESET);
    setUrlParams(new URLSearchParams());
    return;
  }

  const currentState = get(searchStateAtom);
  set(searchStateAtom, { ...currentState, ...update });
});

export const getAddressAtom = atom((get) => get(searchStateAtom)[Components.ADDRESS] || '');
export const getKeywordAtom = atom((get) => get(searchStateAtom)[Components.KEYWORD] || '');
export const getThemeAtom = atom((get) => get(searchStateAtom)[Components.THEME] || []);

export const getPageAtom = atom((get) => get(submittedStateAtom)[Components.PAGE] || 1);
export const setPageAtom = atom(null, (get, set, page: number) => {
  const currentState = get(submittedStateAtom);
  set(submittedStateAtom, { ...currentState, [Components.PAGE]: page });

  const currentParams = new URLSearchParams(window.location.search);
  currentParams.set(Components.PAGE, page.toString());

  setUrlParams(currentParams);
});

export const initializedAtom = atom<boolean>(false);
export const shouldScrollAtom = atom<boolean>(false);

export const getElasticUrl = () => {
  const devUrl = typeof ELASTIC_DEV_URL !== 'undefined' ? ELASTIC_DEV_URL : '';

  return devUrl || drupalSettings?.helfi_strategia?.hyte_search?.elastic_proxy_url || '';
};
export const getElasticUrlAtom = atom(getElasticUrl());
