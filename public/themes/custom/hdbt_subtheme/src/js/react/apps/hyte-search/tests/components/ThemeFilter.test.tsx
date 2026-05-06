import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { ThemeFilter } from '../../components/ThemeFilter';
import { initializedAtom, type SearchState, searchStateAtom } from '../../store';
import { Components } from '../../enum/Components';
import { Themes } from '../../enum/Themes';

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

  it('Renders the theme select with label', () => {
    const label = screen.getByText(Themes.get('hh_kul') as string);
    expect(label).toBeTruthy();
  });
});
