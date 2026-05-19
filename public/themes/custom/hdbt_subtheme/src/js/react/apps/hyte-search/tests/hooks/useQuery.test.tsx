import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { useQuery } from '../../hooks/useQuery';
import { type SearchState, submittedStateAtom } from '../../store';
import { Components } from '../../enum/Components';
import { Themes } from '../../enum/Themes';

type FilterClause = {
  match?: Record<string, unknown>;
  terms?: Record<string, unknown>;
  nested?: { path: string };
};
type SortClause = { _geo_distance?: { 'units.location': { lat: number; lon: number } } };
type TestQuery = {
  from: number;
  size: number;
  query: { bool: { filter: FilterClause[]; should?: unknown[]; minimum_should_match?: number } };
  sort: SortClause[];
};
const narrow = (query: ReturnType<typeof useQuery>) => query as unknown as TestQuery;

const renderQuery = (initialState: SearchState) => {
  const ref: { current: ReturnType<typeof useQuery> } = { current: null };
  const Probe = () => {
    ref.current = useQuery();
    return null;
  };
  render(
    <TestProvider initialValues={[[submittedStateAtom, initialState]]}>
      <Probe />
    </TestProvider>,
  );
  return ref.current;
};

describe('useQuery.tsx', () => {
  it('Builds a base query with the language filter', () => {
    const query = renderQuery({ page: 1 });

    const filter = narrow(query).query.bool.filter;
    expect(filter).toContainEqual({ match: { search_api_language: 'en' } });
    expect(query?.from).toBe(0);
    expect(query?.size).toBe(15);
  });

  it('Adds a theme terms filter when themes are selected', () => {
    const query = renderQuery({
      [Components.THEME]: [
        {
          disabled: false,
          isGroupLabel: false,
          label: Themes.get('hh_kul') as string,
          selected: true,
          value: 'hh_kul',
          visible: true,
        },
      ],
    });

    const filter = narrow(query).query.bool.filter;
    expect(filter).toContainEqual({ terms: { name_synonyms: ['hh_kul'] } });
  });

  it('Returns null when an address has no resolved coordinates', () => {
    const query = renderQuery({ [Components.ADDRESS]: 'Unknown Place' });
    expect(query).toBeNull();
  });

  it('Adds keyword should-clauses and minimum_should_match', () => {
    const query = renderQuery({ [Components.KEYWORD]: 'skating' });

    const bool = narrow(query).query.bool;
    expect(bool.minimum_should_match).toBe(1);
    expect(bool.should?.length ?? 0).toBeGreaterThan(0);
  });

  it('Maps page to from offset', () => {
    const query = renderQuery({ page: 3 });
    expect(query?.from).toBe(30);
  });

  it('Adds a nested geo-distance filter when address coordinates are known', () => {
    const query = renderQuery({
      [Components.ADDRESS]: 'Mannerheimintie 1',
      addressWithCoordinates: { label: 'Mannerheimintie 1', value: [24.9354, 60.1695, 'Mannerheimintie 1'] },
    });

    const narrowed = narrow(query);
    const nested = narrowed.query.bool.filter.find((f) => f.nested?.path === 'units');
    expect(nested).toBeTruthy();
    expect(narrowed.sort[0]._geo_distance?.['units.location']).toEqual({ lat: 60.1695, lon: 24.9354 });
  });
});
