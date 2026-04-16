import { TextInput } from 'hds-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Components } from 'src/js/react/enum/Components';
import { AddressSearch, type AddressWithCoordinates } from '@/react/common/AddressSearch';
import { getAddressAtom, initializedAtom, setSearchStateAtom } from '../store';
import { defaultAddressSearchTexts } from '@/react/common/constants/defaultAddressSearchTexts';

export const SearchBar = () => {
  const initialized = useAtomValue(initializedAtom);
  const setSearchState = useSetAtom(setSearchStateAtom);
  const address = useAtomValue(getAddressAtom);

  if (!initialized) {
    return (
      <TextInput
        disabled
        className='hdbt-search__filter hdbt-search--react__text-field'
        id='search-bar'
        value={address || ''}
      />
    );
  }

  const onChange = (address: string) => {
    setSearchState({ [Components.ADDRESS]: address });
  };

  const onSubmit = (address: AddressWithCoordinates) => {
    setSearchState({ addressWithCoordinates: address, [Components.ADDRESS]: address.label });
  };

  return (
    <AddressSearch
      id={Components.ADDRESS}
      includeCoordinates
      className='hdbt-search__filter hdbt-search--react__text-field'
      onChange={onChange}
      onSubmit={onSubmit}
      texts={defaultAddressSearchTexts}
      value={address || ''}
    />
  );
};
