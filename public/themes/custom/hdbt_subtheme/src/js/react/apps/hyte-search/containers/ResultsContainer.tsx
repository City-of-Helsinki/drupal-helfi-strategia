import { useAtomCallback } from 'jotai/react/utils';
import { useCallback, useEffect } from 'react';
import useSwr from 'swr';

import { AddressNotFound } from '@/react/common/AddressNotFound';
import { Components } from 'src/js/react/enum/Components';
import { estypes } from '@elastic/elasticsearch';
import { getPageAtom, initializedAtom, setPageAtom, shouldScrollAtom, submittedStateAtom } from '../store';
import { GhostList } from '@/react/common/GhostList';
import { ResultCard } from '../components/ResultCard';
import { ResultsWrapper } from '@/react/common/ResultsWrapper';
import { Service } from '../types/Service';
import { useAtomValue, useSetAtom } from 'jotai';
import { useQuery } from '../hooks/useQuery';

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
  const readShouldScroll = useAtomCallback(
    useCallback((get) => get(shouldScrollAtom), [])
  );
  const setShouldScroll = useSetAtom(shouldScrollAtom);

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

  const loading = isLoading || isValidating;

  useEffect(() => {
    if (!readShouldScroll() && !loading && initialized) {
      setShouldScroll(true);
    }
  }, [loading, readShouldScroll, setShouldScroll]);

  if (!initialized) {
    return <GhostList count={10} />
  }

  if (unknownCoordinates) {
    return <AddressNotFound />
  }

  const resultItemCallBack = (item: estypes.SearchHit<any>) => <ResultCard
    key={item._id}
    {...item.fields as Service}
  />;
  

  return (
    <ResultsWrapper
      currentPage={currentPage}
      data={data}
      error={error}
      getHeaderText={() => Drupal.formatPlural(data?.hits.total.value ?? 0, '1 result', '@count results', {}, {context: 'Hyte search'})}
      isLoading={loading}
      resultItemCallBack={resultItemCallBack}
      setPage={setPage}
      shouldScroll={readShouldScroll() && !loading}
      size={10}
    />
  );
};
