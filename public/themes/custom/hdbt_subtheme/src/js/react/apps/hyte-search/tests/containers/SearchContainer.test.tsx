import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchContainer } from '../../containers/SearchContainer';
import { TestProvider } from '../../testutils/TestProvider';

vi.mock('swr/immutable', () => ({
  default: () => ({ data: undefined, isLoading: true, isValidating: false }),
}));

describe('SearchContainer.tsx', () => {
  it('Renders the form and the loading placeholder before initialization', () => {
    render(
      <TestProvider initialValues={[]}>
        <SearchContainer />
      </TestProvider>,
    );

    expect(screen.getByRole('search')).toBeTruthy();
    expect(screen.getByText('Search results are loading')).toBeTruthy();
  });
});
