import { fireEvent, render, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../../components/SearchBar';
import { Components } from '../../enum/Components';
import { initializedAtom, submitStateAtom, submittedStateAtom } from '../../store';

const address = 'Mannerheimintie 1';
const coordinates = [24.9354, 60.1695];

// Both the suggestion list and the address-to-coordinates lookup read the service map.
const mockServiceMap = () =>
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            results:
              new URL(url).searchParams.get('language') === 'fi'
                ? [{ location: { coordinates }, name: { fi: address } }]
                : [],
          }),
      }),
    ),
  );

describe('Address search flow', () => {
  it('Submits coordinates for an address picked from the suggestions', async () => {
    mockServiceMap();
    const store = createStore();
    store.set(initializedAtom, true);

    render(
      <Provider store={store}>
        <SearchBar />
      </Provider>,
    );

    const input = document.querySelector('input[role="combobox"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Mannerheimintie' } });

    const option = await waitFor(() => {
      const element = document.querySelector('li[role="option"]');
      if (!element) {
        throw new Error('Suggestions not rendered yet');
      }
      return element as HTMLElement;
    });
    fireEvent.click(option);
    await waitFor(() => expect(input.value).toBe(address));

    // HDS Search does not call AddressSearch's onSubmit when a suggestion is picked,
    // so submitting has to resolve the coordinates the geo filter needs.
    await store.set(submitStateAtom);

    const submitted = store.get(submittedStateAtom);
    expect(submitted[Components.ADDRESS]).toBe(address);
    expect(submitted.addressWithCoordinates?.value).toEqual([...coordinates, address]);
  });
});
