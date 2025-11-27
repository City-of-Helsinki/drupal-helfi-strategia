import type { estypes } from '@elastic/elasticsearch';
import { useAtomValue, useSetAtom } from 'jotai';
import { useAtomCallback } from 'jotai/react/utils';
import { useCallback, useEffect } from 'react';
import { Components } from 'src/js/react/enum/Components';
import useSwr from 'swr';
import { AddressNotFound } from '@/react/common/AddressNotFound';
import { GhostList } from '@/react/common/GhostList';
import { ResultsWrapper } from '@/react/common/ResultsWrapper';
import { ResultCard } from '../components/ResultCard';
import { useQuery } from '../hooks/useQuery';
import {
  getElasticUrlAtom,
  getPageAtom,
  initializedAtom,
  setPageAtom,
  shouldScrollAtom,
  submittedStateAtom,
} from '../store';
import type { Service } from '../types/Service';

export const ResultsContainer = () => {
  const url = useAtomValue(getElasticUrlAtom);
  const initialized = useAtomValue(initializedAtom);
  const query = useQuery();
  const submittedState = useAtomValue(submittedStateAtom);
  const currentPage = useAtomValue(getPageAtom);
  const setPage = useSetAtom(setPageAtom);
  const readShouldScroll = useAtomCallback(
    useCallback((get) => get(shouldScrollAtom), []),
  );
  const setShouldScroll = useSetAtom(shouldScrollAtom);

  const fetcher = useCallback(
    (query: string) =>
      fetch(`${url}/hyte/_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query,
      }).then((res) => res.json()),
    [url],
  );

  const unknownCoordinates =
    submittedState[Components.ADDRESS]?.length &&
    !submittedState.addressWithCoordinates?.value;
  const shouldFetch = initialized && !unknownCoordinates;
  const { data, isLoading, isValidating, error } = useSwr(
    shouldFetch ? JSON.stringify(query) : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const loading = isLoading || isValidating;

  useEffect(() => {
    if (!readShouldScroll() && !loading && initialized) {
      setShouldScroll(true);
    }
  }, [initialized, loading, readShouldScroll, setShouldScroll]);

  if (!initialized) {
    return <GhostList count={10} />;
  }

  if (unknownCoordinates) {
    return <AddressNotFound />;
  }

  const resultItemCallBack = (item: estypes.SearchHit<Service>) => {
    const service = item.inner_hits?.collapsed_services.hits.hits[0];

    if (!service) {
      throw new Error('Service inner hit is missing');
    }

    return <ResultCard key={item._id} {...(service.fields as Service)} />;
  };

  return (
    <ResultsWrapper
      currentPage={currentPage}
      data={data}
      error={error}
      getHeaderText={() =>
        Drupal.formatPlural(
          data.aggregations?.total_services?.value ?? 0,
          '1 result',
          '@count results',
          {},
          { context: 'Hyte search' },
        )
      }
      isLoading={loading}
      resultItemCallBack={resultItemCallBack}
      setPage={setPage}
      shouldScroll={readShouldScroll() && !loading}
      size={10}
    />
  );
};
