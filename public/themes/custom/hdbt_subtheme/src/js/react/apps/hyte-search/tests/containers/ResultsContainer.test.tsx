import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { describe, expect, it, vi } from 'vitest';
import { ResultsContainer } from '../../containers/ResultsContainer';
import { Components } from '../../enum/Components';
import { initializedAtom, type SearchState, submittedStateAtom } from '../../store';
import { TestProvider } from '../../testutils/TestProvider';

// Two pages worth of results with Global.SIZE (15) per page.
const TOTAL = 25;

// Minimal Elastic response: one collapsed service per page.
const responseFor = (page: number) => ({
  aggregations: { total_services: { value: TOTAL } },
  hits: {
    total: { value: TOTAL },
    hits: [
      {
        _id: `service-${page}`,
        inner_hits: {
          collapsed_services: {
            hits: {
              hits: [
                {
                  fields: {
                    description_summary: [`Description ${page}`],
                    name: [`Service ${page}`],
                    url: [`https://example.com/service/${page}`],
                  },
                },
              ],
            },
          },
        },
      },
    ],
  },
});

const pageLink = (page: string) =>
  Array.from(document.querySelectorAll('.hds-pagination__item-link')).find(
    (el) => el.textContent === page,
  ) as HTMLElement;

describe('ResultsContainer.tsx', () => {
  it('Renders the loading placeholder while not initialized', () => {
    render(
      <TestProvider initialValues={[[initializedAtom, false]]}>
        <ResultsContainer />
      </TestProvider>,
    );

    expect(screen.getByText('Search results are loading')).toBeTruthy();
  });

  it('Renders the empty results message when coordinates are missing', () => {
    const mockSubmittedState: SearchState = {
      [Components.ADDRESS]: 'Unknown Place',
    };

    render(
      <TestProvider
        initialValues={[
          [initializedAtom, true],
          [submittedStateAtom, mockSubmittedState],
        ]}
      >
        <ResultsContainer />
      </TestProvider>,
    );

    expect(screen.getByText('No results')).toBeTruthy();
    expect(
      screen.getByText('No results were found for the criteria you entered. Try changing your search criteria.'),
    ).toBeTruthy();
  });

  it('Moves focus to the first result when changing page', async () => {
    let page = 1;
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(responseFor(page)) })),
    );

    render(
      <TestProvider initialValues={[[initializedAtom, true]]}>
        <ResultsContainer />
      </TestProvider>,
    );

    await screen.findByText('Service 1');
    // Initial load must not steal focus.
    expect(document.activeElement).toBe(document.body);

    // The pager must be built from the same page size the query fetches with, so 25
    // results make two pages, not three.
    expect(pageLink('2')).toBeTruthy();
    expect(pageLink('3')).toBeFalsy();

    page = 2;
    fireEvent.click(pageLink('2'));

    await waitFor(() => expect(screen.queryByText('Service 2')).toBeTruthy());
    await waitFor(() => expect(document.activeElement?.getAttribute('href')).toBe('https://example.com/service/2'));
  });

  it('Moves focus to the empty results when the submitted address is not found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(responseFor(1)) })),
    );
    const store = createStore();
    store.set(initializedAtom, true);

    render(
      <Provider store={store}>
        <ResultsContainer />
      </Provider>,
    );

    await screen.findByText('Service 1');

    // Nothing is fetched for an unresolved address, so there is no loading cycle to
    // drive the focus change.
    act(() => store.set(submittedStateAtom, { page: 1, [Components.ADDRESS]: 'Unknown Place' }));

    await waitFor(() => expect(document.activeElement?.textContent?.trim()).toBe('No results'));
  });
});
