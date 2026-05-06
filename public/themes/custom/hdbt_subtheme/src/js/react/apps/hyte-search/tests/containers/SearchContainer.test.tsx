import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { SearchContainer } from '../../containers/SearchContainer';

vi.mock('swr/immutable', () => ({
  default: () => ({ data: undefined, isLoading: true, isValidating: false }),
}));

describe('SearchContainer.tsx', () => {
  render(
    <TestProvider initialValues={[]}>
      <SearchContainer />
    </TestProvider>,
  );

  it('Renders the form and the loading placeholder before initialization', () => {
    expect(screen.getByRole('search')).toBeTruthy();
    expect(screen.getByText('Search results are loading')).toBeTruthy();
  });
});
