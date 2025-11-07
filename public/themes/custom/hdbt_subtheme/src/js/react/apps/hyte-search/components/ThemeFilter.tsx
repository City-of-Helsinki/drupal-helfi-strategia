import { Option, Select } from 'hds-react';
import { useAtomValue, useSetAtom } from 'jotai';

import { getThemeAtom, initializedAtom, setSearchStateAtom } from '../store';
import { Components } from 'src/js/react/enum/Components';
import { Themes } from 'src/js/react/enum/Themes';

const options = [...Themes].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));

export const ThemeFilter = () => {
  const initialized = useAtomValue(initializedAtom);
  const themes = useAtomValue(getThemeAtom);
  const setSearchState = useSetAtom(setSearchStateAtom);

  const setThemes = (selected: Option[]) => {
    setSearchState({[Components.THEME]: selected});
  };

  return (
    <Select
      disabled={!initialized}
      id={Components.THEME}
      multiSelect
      noTags
      options={options}
      onChange={setThemes}
      texts={{
        label: Drupal.t('Theme', {}, { context: 'React search' }),
      }}
      value={themes}
    />
  );
};
