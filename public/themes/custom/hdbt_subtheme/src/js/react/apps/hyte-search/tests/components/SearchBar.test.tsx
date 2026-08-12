import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchBar } from '../../components/SearchBar';
import { Components } from '../../enum/Components';
import { initializedAtom, type SearchState, searchStateAtom } from '../../store';
import { TestProvider } from '../../testutils/TestProvider';

const address = 'Mannerheimintie 1';
const mockSearchState: SearchState = {
  [Components.ADDRESS]: address,
};

describe('SearchBar.tsx', () => {
  it('Renders the address input with the correct value', () => {
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

    expect(screen.getByDisplayValue(address)).toBeTruthy();
  });
});
