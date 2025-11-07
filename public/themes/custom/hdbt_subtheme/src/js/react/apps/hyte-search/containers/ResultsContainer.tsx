import { useCallback } from 'react';
import useSwr from 'swr';

import { AddressNotFound } from '@/react/common/AddressNotFound';
import { estypes } from '@elastic/elasticsearch';
import { GhostList } from '@/react/common/GhostList';
import { getPageAtom, initializedAtom, setPageAtom, submittedStateAtom } from '../store';
import { ResultCard } from '../components/ResultCard';
import { ResultsWrapper } from '@/react/common/ResultsWrapper';
import { Service } from '../types/Service';
import { useAtomValue, useSetAtom } from 'jotai';
import { useQuery } from '../hooks/useQuery';
import { Components } from 'src/js/react/enum/Components';

export const ResultsContainer  = ({
  url,
}: {
  url: string;
}) => {
  const initialized = useAtomValue(initializedAtom);
  const query = useQuery();
  const submittedState = useAtomValue(submittedStateAtom);
  const currentPage = useAtomValue(getPageAtom);
  const setPage = useSetAtom(setPageAtom);

  const fetcher = useCallback((query: string) => fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: query,
  }).then(res => res.json()), [url]);

  const unknownCoordinates = submittedState[Components.ADDRESS]?.length && !submittedState.addressWithCoordinates?.value;
  const shouldFetch = initialized && !unknownCoordinates;
  const { data, isLoading, isValidating, error } = useSwr(shouldFetch ? JSON.stringify(query) : null, fetcher, {
    revalidateOnFocus: false,
  });

  if (!initialized) {
    return <GhostList count={10} />
  }

  if (unknownCoordinates) {
    return <AddressNotFound />
  }

  const loading = isLoading || isValidating;

  const resultItemCallBack = (item: estypes.SearchHit<any>) => <ResultCard
    key={item._id}
    {...item.fields as Service}
  />;

  return (
    <ResultsWrapper
      currentPage={currentPage}
      getHeaderText={() => Drupal.formatPlural(data?.hits.total.value ?? 0, '1 result', '@count results', {}, {context: 'Hyte search'})}
      data={data}
      error={error}
      isLoading={loading}
      resultItemCallBack={resultItemCallBack}
      setPage={setPage}
      shouldScroll={initialized}
      size={10}
    />
  );
};
