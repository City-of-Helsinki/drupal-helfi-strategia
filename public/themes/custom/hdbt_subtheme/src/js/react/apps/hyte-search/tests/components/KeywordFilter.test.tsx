import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { KeywordFilter } from '../../components/KeywordFilter';
import { initializedAtom, type SearchState, searchStateAtom } from '../../store';
import { Components } from '../../enum/Components';

const mockSearchState: SearchState = {
  [Components.KEYWORD]: 'test keyword',
};

describe('KeywordFilter.tsx', () => {
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

  it('Renders the keyword input with the correct value', () => {
    const input = document.getElementById(Components.KEYWORD) as HTMLInputElement;
    expect(input.value).toBe(mockSearchState[Components.KEYWORD]);
  });
});
