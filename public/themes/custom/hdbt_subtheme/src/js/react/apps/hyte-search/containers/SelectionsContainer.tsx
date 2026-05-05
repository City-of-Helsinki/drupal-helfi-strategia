// biome-ignore-all lint/correctness/noUnusedFunctionParameters: @todo UHF-12501
import type { Option } from 'hds-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { RESET } from 'jotai/utils';

import { Components } from 'src/js/react/enum/Components';
import FilterButton from '@/react/common/FilterButton';
import SelectionsWrapper from '@/react/common/SelectionsWrapper';
import { type SearchState, setSearchStateAtom, submitStateAtom, submittedStateAtom } from '../store';

export const SelectionsContainer = () => {
  const submittedState = useAtomValue(submittedStateAtom);
  const setState = useSetAtom(setSearchStateAtom);
  const updateQuery = useSetAtom(submitStateAtom);

  const selections: JSX.Element[] = [];

  const removeArrayItem = (key: keyof SearchState, value: string) => {
    const existing = submittedState[key];
    if (!Array.isArray(existing)) {
      return;
    }
    const newArr = existing.filter((item) => item.value !== value);
    setState({ [key]: newArr } as Partial<SearchState>);
    updateQuery();
  };

  const unsetStateItem = (key: keyof SearchState) => {
    setState({ [key]: undefined } as Partial<SearchState>);
    updateQuery();
  };

  Object.entries({ ...submittedState })
    .filter(([key]) => !([Components.ADDRESS, Components.PAGE] as readonly string[]).includes(key))
    .forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        (value as Option[]).forEach((option) => {
          selections.push(
            <FilterButton
              key={`${key}-${option.value}`}
              clearSelection={() => removeArrayItem(key as keyof SearchState, String(option.value))}
              value={String(option.label)}
            />,
          );
        });
      } else if (typeof value === 'string' && value.length) {
        selections.push(
          <FilterButton
            key={`${key}-${value}`}
            clearSelection={() => unsetStateItem(key as keyof SearchState)}
            value={value}
          />,
        );
      }
    });

  return (
    <SelectionsWrapper
      showClearButton={selections.length || submittedState[Components.ADDRESS]?.length}
      resetForm={() => setState(RESET)}
    >
      {selections}
    </SelectionsWrapper>
  );
};
