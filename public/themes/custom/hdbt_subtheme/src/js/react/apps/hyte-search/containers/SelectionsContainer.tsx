// biome-ignore-all lint/correctness/noUnusedFunctionParameters: @todo UHF-12501
import { useAtomValue, useSetAtom } from 'jotai';
import { RESET } from 'jotai/utils';

import { Components } from 'src/js/react/enum/Components';
import FilterButton from '@/react/common/FilterButton';
import SelectionsWrapper from '@/react/common/SelectionsWrapper';
import {
  setSearchStateAtom,
  submitStateAtom,
  submittedStateAtom,
} from '../store';

export const SelectionsContainer = () => {
  const submittedState = useAtomValue(submittedStateAtom);
  const setState = useSetAtom(setSearchStateAtom);
  const updateQuery = useSetAtom(submitStateAtom);

  const selections: JSX.Element[] = [];

  const removeArrayItem = (key: string, value: string) => {
    const state = { ...submittedState };
    const existingItem = [...state[key]];
    existingItem.splice(
      state[key].findIndex((item) => item.value === value),
      1,
    );
    state[key] = existingItem;
    setState(state);
    updateQuery(state);
  };

  const unsetStateItem = (key: string) => {
    const state = { ...submittedState };
    state[key] = undefined;
    setState(state);
    updateQuery(state);
  };

  Object.entries({ ...submittedState })
    .filter(([key]) => ![Components.ADDRESS, Components.PAGE].includes(key))
    .forEach(([key, value], index) => {
      if (Array.isArray(value) && value.length) {
        value.forEach((option: string) => {
          selections.push(
            <FilterButton
              key={`${key}-${option.value}`}
              clearSelection={() => removeArrayItem(key, option.value)}
              value={option.label}
            />,
          );
        });
      } else if (typeof value === 'string' && value.length) {
        selections.push(
          <FilterButton
            key={`${key}-${value}`}
            clearSelection={() => unsetStateItem(key)}
            value={value}
          />,
        );
      }
    });

  return (
    <SelectionsWrapper
      showClearButton={
        selections.length || submittedState[Components.ADDRESS]?.length
      }
      resetForm={() => setState(RESET)}
    >
      {selections}
    </SelectionsWrapper>
  );
};
