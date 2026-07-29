import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KeywordFilter } from '../../components/KeywordFilter';
import { Components } from '../../enum/Components';
import { initializedAtom, type SearchState, searchStateAtom } from '../../store';
import { TestProvider } from '../../testutils/TestProvider';

const mockSearchState: SearchState = {
  [Components.KEYWORD]: 'test keyword',
};

describe('KeywordFilter.tsx', () => {
  it('Renders the keyword input with the correct value', () => {
    render(
      <TestProvider
        initialValues={[
          [initializedAtom, true],
          [searchStateAtom, mockSearchState],
        ]}
      >
        <KeywordFilter />
      </TestProvider>,
    );

    const input = document.getElementById(Components.KEYWORD) as HTMLInputElement;
    expect(input.value).toBe(mockSearchState[Components.KEYWORD]);
  });
});
