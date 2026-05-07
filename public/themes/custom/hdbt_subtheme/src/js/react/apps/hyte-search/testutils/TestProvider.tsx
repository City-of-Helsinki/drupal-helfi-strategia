// biome-ignore-all lint/suspicious/noExplicitAny: @todo UHF-12501
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

type propType = { initialValues: any; children: JSX.Element };

const HydrateAtoms = ({ initialValues, children }: propType) => {
  useHydrateAtoms(initialValues);
  return children;
};

export const TestProvider = ({ initialValues, children }: propType) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
);
