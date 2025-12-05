// biome-ignore-all lint/style/noNonNullAssertion: @todo UHF-12501
import type { estypes } from '@elastic/elasticsearch';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Components } from 'src/js/react/enum/Components';
import {
  IndexFields,
  UnitFields,
  UnitImageFields,
} from 'src/js/react/enum/IndexFields';
import { submittedStateAtom } from '../store';

const dataFields = [
  `${IndexFields.NAME}^5`,
  `${IndexFields.NAME_OVERRIDE}^5`,
  IndexFields.DESCRIPTION_SUMMARY,
];

export const useQuery = (): estypes.SearchRequest | null => {
  const submittedState = useAtomValue(submittedStateAtom);

  return useMemo(() => {
    const filter: estypes.QueryDslQueryContainer[] = [
      {
        match: {
          [IndexFields.SEARCH_API_LANGUAGE]:
            drupalSettings.path.currentLanguage,
        },
      },
    ];
    const should: estypes.QueryDslQueryContainer[] = [];
    const sort: estypes.Sort = [
      {
        _script: {
          type: 'string',
          script: {
            source: `doc['name_override.keyword'].size() > 0 ? doc['name_override.keyword'].value : doc['name.keyword'].value`,
          },
          order: 'asc',
        },
      },
    ];

    if (submittedState[Components.THEME]?.length) {
      filter.push({
        terms: {
          [IndexFields.NAME_SYNONYMS]: submittedState[Components.THEME]!.map(
            (theme) => theme.value,
          ),
        },
      });
    }

    const unknownCoordinates =
      submittedState[Components.ADDRESS]?.length &&
      !submittedState.addressWithCoordinates?.value;
    if (unknownCoordinates) {
      return null;
    }

    if (
      submittedState[Components.ADDRESS]?.length &&
      submittedState.addressWithCoordinates?.value
    ) {
      const [lon, lat] = submittedState.addressWithCoordinates.value;

      filter.push({
        nested: {
          inner_hits: {
            _source: false,
            fields: [...Object.values(UnitImageFields)],
            name: 'sorted_units',
            size: 100,
            sort: [
              {
                _geo_distance: {
                  [UnitFields.LOCATION]: { lat, lon },
                  order: 'asc',
                },
              },
            ],
          },
          path: 'units',
          query: { exists: { field: UnitFields.NAME } },
        },
      });
      sort.unshift({
        _geo_distance: {
          [UnitFields.LOCATION]: { lat, lon },
          order: 'asc',
          unit: 'km',
          nested: { path: 'units' },
        },
      });
    }

    const searchTerm = submittedState[Components.KEYWORD] || '';
    if (searchTerm.length) {
      should.push(
        {
          multi_match: {
            query: searchTerm,
            fields: dataFields,
            type: 'best_fields',
            operator: 'or',
            fuzziness: 0,
          },
        },
        {
          multi_match: {
            query: searchTerm,
            fields: dataFields,
            type: 'best_fields',
            operator: 'or',
            fuzziness: 'AUTO',
          },
        },
        {
          multi_match: {
            query: searchTerm,
            fields: dataFields,
            type: 'phrase',
            operator: 'or',
          },
        },
        {
          multi_match: {
            query: searchTerm,
            fields: dataFields,
            type: 'phrase_prefix',
            operator: 'or',
          },
        },
      );
      [
        IndexFields.NAME,
        IndexFields.NAME_OVERRIDE,
        IndexFields.DESCRIPTION_SUMMARY,
      ].forEach((field) => {
        should.push({ wildcard: { [field]: `*${searchTerm.toLowerCase()}*` } });
      });
    }

    const query: estypes.QueryDslQueryContainer = { bool: { filter } };

    if (query.bool && should.length) {
      query.bool.should = should;
      query.bool.minimum_should_match = 1;
    }

    const size = 15;
    const page = submittedState.page || 1;

    const result = {
      _source: false,
      aggs: {
        total_services: {
          cardinality: {
            field: IndexFields.SEARCH_API_ID,
            precision_threshold: 3000,
          },
        },
      },
      collapse: {
        field: IndexFields.SEARCH_API_ID,
        inner_hits: {
          _source: false,
          fields: [
            IndexFields.DESCRIPTION_SUMMARY,
            IndexFields.NAME,
            IndexFields.NAME_SYNONYMS,
            IndexFields.URL,
            UnitFields.NAME_OVERRIDE,
            UnitFields.NAME,
            ...Object.values(UnitImageFields),
          ],
          name: 'collapsed_services',
        },
      },
      from: size * (page - 1),
      query,
      size,
      sort,
    };

    return result;
  }, [submittedState]);
};
