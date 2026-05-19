import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { SearchBar } from '../../components/SearchBar';
import { initializedAtom, type SearchState, searchStateAtom } from '../../store';
import { Components } from '../../enum/Components';

const address = 'Mannerheimintie 1';
const mockSearchState: SearchState = {
  [Components.ADDRESS]: address,
};

describe('SearchBar.tsx', () => {
  render(
    <TestProvider
      initialValues={[
        [initializedAtom, true],
        [searchStateAtom, mockSearchState],
      ]}
    >
      <SearchBar />
    </TestProvider>,
  );

  it('Renders the address input with the correct value', () => {
    expect(screen.getByDisplayValue(address)).toBeTruthy();
  });
});
