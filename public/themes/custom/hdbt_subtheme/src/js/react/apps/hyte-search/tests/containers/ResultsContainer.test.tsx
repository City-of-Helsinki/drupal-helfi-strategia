import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { ResultsContainer } from '../../containers/ResultsContainer';
import { initializedAtom, type SearchState, submittedStateAtom } from '../../store';
import { Components } from '../../enum/Components';

describe('ResultsContainer.tsx', () => {
  it('Renders the loading placeholder while not initialized', () => {
    render(
      <TestProvider initialValues={[[initializedAtom, false]]}>
        <ResultsContainer />
      </TestProvider>,
    );

    expect(screen.getByText('Search results are loading')).toBeTruthy();
  });

  it('Renders the address-not-found message when coordinates are missing', () => {
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

    expect(screen.getByText('No results for the address entered')).toBeTruthy();
  });
});
