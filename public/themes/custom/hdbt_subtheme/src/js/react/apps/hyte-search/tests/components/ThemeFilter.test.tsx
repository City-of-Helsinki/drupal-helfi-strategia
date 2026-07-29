import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeFilter } from '../../components/ThemeFilter';
import { Components } from '../../enum/Components';
import { Themes } from '../../enum/Themes';
import { initializedAtom, type SearchState, searchStateAtom } from '../../store';
import { TestProvider } from '../../testutils/TestProvider';

const mockSearchState: SearchState = {
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
};

describe('ThemeFilter.tsx', () => {
  it('Renders the theme select with label', () => {
    render(
      <TestProvider
        initialValues={[
          [initializedAtom, true],
          [searchStateAtom, mockSearchState],
        ]}
      >
        <ThemeFilter />
      </TestProvider>,
    );

    const label = screen.getByText(Themes.get('hh_kul') as string);
    expect(label).toBeTruthy();
  });
});
