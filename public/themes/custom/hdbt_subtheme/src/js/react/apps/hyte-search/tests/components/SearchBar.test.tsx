import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchBar } from '../../components/SearchBar';
import { Components } from '../../enum/Components';
import { initializedAtom, type SearchState, searchStateAtom, submittedStateAtom } from '../../store';
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

  it('Shows the address error under the input when a submitted address had no matches', () => {
    render(
      <TestProvider
        initialValues={[
          [initializedAtom, true],
          [searchStateAtom, mockSearchState],
          [submittedStateAtom, mockSearchState],
        ]}
      >
        <SearchBar />
      </TestProvider>,
    );

    expect(screen.getByText(/Make sure the address is correct/)).toBeTruthy();
  });

  it('Shows no address error once the address resolved to coordinates', () => {
    const resolved: SearchState = {
      ...mockSearchState,
      addressWithCoordinates: { label: address, value: [24.93, 60.16, address] },
    };

    render(
      <TestProvider
        initialValues={[
          [initializedAtom, true],
          [searchStateAtom, resolved],
          [submittedStateAtom, resolved],
        ]}
      >
        <SearchBar />
      </TestProvider>,
    );

    expect(screen.queryByText(/Make sure the address is correct/)).toBeNull();
  });
});
