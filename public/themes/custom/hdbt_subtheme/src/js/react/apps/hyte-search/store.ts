import type { estypes } from '@elastic/elasticsearch';
import type { Option } from 'hds-react';
import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import type { AddressWithCoordinates } from '@/react/common/AddressSearch';
import useAddressToCoordsQuery from '@/react/common/hooks/useAddressToCoordsQuery';
import { Components } from '../../enum/Components';
import { Themes } from '../../enum/Themes';

declare const ELASTIC_DEV_URL: string | undefined;

type aggsType =
  | { [key: string]: estypes.AggregationsStringTermsBucket }
  | undefined;
export const aggsAtom = atom<aggsType>(undefined);

type SearchState = {
  [Components.ADDRESS]?: string;
  [Components.KEYWORD]?: string;
  [Components.PAGE]?: number;
  [Components.THEME]?: Option[];
  addressWithCoordinates?: AddressWithCoordinates;
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
    .filter(([key]) => key !== 'addressWithCoordinates')
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

export const searchStateAtom = atomWithReset<SearchState>({ page: 1 });
export const submittedStateAtom = atomWithReset<SearchState>({ page: 1 });
export const submitStateAtom = atom(null, (get, set) => {
  const currentState = { ...get(searchStateAtom) };
  set(submittedStateAtom, currentState);
  setUrlParams(selectionsToURLParams(currentState));
});

export const initializeAppAtom = atom(
  null,
  async (_get, set, aggs: aggsType) => {
    set(aggsAtom, aggs);
    let coordinatesData: [number, number, string] | null = null;

    if (initialParams[Components.ADDRESS]) {
      // @todo refactor address query functionality to have a non-hook version
      // biome-ignore lint/correctness/useHookAtTopLevel: will be replaced at a later time
      coordinatesData = await useAddressToCoordsQuery(
        initialParams[Components.ADDRESS],
      );
    }
    if (coordinatesData) {
      const address = initialParams[Components.ADDRESS] || '';
      initialParams.addressWithCoordinates = {
        label: address,
        value: coordinatesData,
      };
    }

    set(searchStateAtom, { ...initialParams });
    set(submittedStateAtom, { ...initialParams });
    set(initializedAtom, true);
  },
);

export const setSearchStateAtom = atom(
  null,
  (get, set, update: Partial<SearchState> | typeof RESET) => {
    if (update === RESET) {
      set(searchStateAtom, RESET);
      set(submittedStateAtom, RESET);
      setUrlParams(new URLSearchParams());
      return;
    }

    const currentState = get(searchStateAtom);
    set(searchStateAtom, { ...currentState, ...update });
  },
);

export const getAddressAtom = atom(
  (get) => get(searchStateAtom)[Components.ADDRESS] || '',
);
export const getKeywordAtom = atom(
  (get) => get(searchStateAtom)[Components.KEYWORD] || '',
);
export const getThemeAtom = atom(
  (get) => get(searchStateAtom)[Components.THEME] || [],
);

export const getPageAtom = atom(
  (get) => get(submittedStateAtom)[Components.PAGE] || 1,
);
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

  return (
    devUrl ||
    drupalSettings?.helfi_strategia?.hyte_search?.elastic_proxy_url ||
    ''
  );
};
export const getElasticUrlAtom = atom(getElasticUrl());
