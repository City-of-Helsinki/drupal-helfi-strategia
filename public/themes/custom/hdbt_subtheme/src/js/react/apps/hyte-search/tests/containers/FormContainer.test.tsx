import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestProvider } from '../../testutils/TestProvider';
import { FormContainer } from '../../containers/FormContainer';
import { initializedAtom } from '../../store';

describe('FormContainer.tsx', () => {
  render(
    <TestProvider initialValues={[[initializedAtom, true]]}>
      <FormContainer />
    </TestProvider>,
  );

  it('Renders the search form with a submit button', () => {
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
