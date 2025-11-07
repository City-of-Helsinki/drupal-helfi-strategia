import { Button } from 'hds-react';
import { KeywordFilter } from '../components/KeywordFilter';
import { SearchBar } from '../components/SearchBar';
import { ThemeFilter } from '../components/ThemeFilter';
import { useSetAtom } from 'jotai';
import { submitStateAtom } from '../store';
import { SelectionsContainer } from './SelectionsContainer';

export const FormContainer = () => {
  const submit = useSetAtom(submitStateAtom);

  return (
    <form
      className='hdbt-search--react__form-container'
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      role='search'
    >
      <SearchBar />
      <div className='hdbt-search--react__dropdown-filters'>
        <KeywordFilter />
        <ThemeFilter />
      </div>
      <Button
        className='hdbt-search--react__submit-button'
        type='submit'
      >
        {Drupal.t('Search', {}, {context: 'React search: submit button label'})}
      </Button>
      <SelectionsContainer />
    </form>
  );
};
