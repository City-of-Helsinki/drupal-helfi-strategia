import { TextInput } from 'hds-react';
import { useAtomValue, useSetAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { Components } from '../enum/Components';
import { getKeywordAtom, initializedAtom, setSearchStateAtom } from '../store';

export const KeywordFilter = () => {
  const initialized = useAtomValue(initializedAtom);
  const setSearchState = useSetAtom(setSearchStateAtom);
  const keyword = useAtomValue(getKeywordAtom);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchState({ [Components.KEYWORD]: event.target.value });
  };

  return (
    <TextInput
      disabled={!initialized}
      id={Components.KEYWORD}
      label={Drupal.t('Search term', {}, { context: 'Search keyword label' })}
      onChange={onChange}
      placeholder={Drupal.t('For example, skating or nature trail', {}, { context: 'Hyte search' })}
      value={keyword || ''}
    />
  );
};
