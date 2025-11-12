import { useAtomValue, useSetAtom } from 'jotai';
import { FormContainer } from './FormContainer';
import { ResultsContainer } from './ResultsContainer';
import { initializeAppAtom, initializedAtom } from '../store';
import useSWRImmutable from 'swr/immutable';
import { IndexFields } from 'src/js/react/enum/IndexFields';
import { estypes } from '@elastic/elasticsearch';
import { useEffect } from 'react';

const aggsQueryString = JSON.stringify({
  _source: false,
  aggs: {
    themes: {
      terms: {
        field: `${IndexFields.NAME_SYNONYMS}.keyword`,
        size: 10000,
        order: { _key: 'asc' },
      }
    }
  },
  query: {
    match_all: {}
  },
});

export const SearchContainer  = ({
  url,
}: {
  url: string;
}) => {
  const initialized = useAtomValue(initializedAtom);
  const initializeApp = useSetAtom(initializeAppAtom);

  const fetcher = async(query: string) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error('Could not query aggregations, initialization failed');
    }

    return await response.json() as estypes.SearchResponse;
  };

  const { data, isLoading, isValidating } = useSWRImmutable(aggsQueryString, fetcher);
  const loading = isLoading || isValidating;

  useEffect(() => {
    if (!initialized && !loading && data) {
      initializeApp({
        themes: data.aggregations?.themes.buckets,
      }); 
    }
  }, [data]);

  return (
    <>
      <FormContainer />
      <ResultsContainer url={url} />
    </>
  );
};
