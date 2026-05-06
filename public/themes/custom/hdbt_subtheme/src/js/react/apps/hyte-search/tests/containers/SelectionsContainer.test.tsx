import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { SelectionsContainer } from '../../containers/SelectionsContainer';
import { type SearchState, submittedStateAtom } from '../../store';
import { Components } from '../../enum/Components';
import { Themes } from '../../enum/Themes';

const mockSubmittedState: SearchState = {
  [Components.KEYWORD]: 'skating',
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

describe('SelectionsContainer.tsx', () => {
  render(
    <TestProvider initialValues={[[submittedStateAtom, mockSubmittedState]]}>
      <SelectionsContainer />
    </TestProvider>,
  );

  it('Renders a selection tag for each non-address selection', () => {
    expect(screen.getByText(mockSubmittedState[Components.KEYWORD] as string)).toBeTruthy();
    expect(screen.getByText(Themes.get('hh_kul') as string)).toBeTruthy();
  });
});
