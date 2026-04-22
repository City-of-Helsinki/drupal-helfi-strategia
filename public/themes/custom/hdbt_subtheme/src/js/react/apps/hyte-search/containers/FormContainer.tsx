// biome-ignore-all lint/a11y/useSemanticElements: @todo UHF-12501
import { Button } from 'hds-react';
import { useSetAtom } from 'jotai';
import { useAddressSearchForm } from '@/react/common/hooks/useAddressSearchForm';
import { KeywordFilter } from '../components/KeywordFilter';
import { SearchBar } from '../components/SearchBar';
import { ThemeFilter } from '../components/ThemeFilter';
import { submitStateAtom } from '../store';
import { SelectionsContainer } from './SelectionsContainer';

export const FormContainer = () => {
  const submit = useSetAtom(submitStateAtom);
  const { formRef, handleKeyDown } = useAddressSearchForm();

  return (
    <form
      ref={formRef}
      className='hdbt-search--react__form-container'
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onKeyDown={handleKeyDown}
      role='search'
    >
      <SearchBar />
      <div className='hdbt-search--react__dropdown-filters'>
        <KeywordFilter />
        <ThemeFilter />
      </div>
      <Button className='hdbt-search--react__submit-button' type='submit'>
        {Drupal.t('Search', {}, { context: 'React search: submit button label' })}
      </Button>
      <SelectionsContainer />
    </form>
  );
};
