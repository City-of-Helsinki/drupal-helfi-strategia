import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormContainer } from '../../containers/FormContainer';
import { initializedAtom } from '../../store';
import { TestProvider } from '../../testutils/TestProvider';

describe('FormContainer.tsx', () => {
  it('Renders the search form with a submit button', () => {
    render(
      <TestProvider initialValues={[[initializedAtom, true]]}>
        <FormContainer />
      </TestProvider>,
    );

    expect(screen.getByRole('search')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy();
  });

  it('Submitting the form runs the onSubmit handler without reloading', () => {
    render(
      <TestProvider initialValues={[[initializedAtom, true]]}>
        <FormContainer />
      </TestProvider>,
    );

    const form = screen.getByRole('search');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    fireEvent(form, submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
  });
});
