import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResultCard } from '../../components/ResultCard';
import { Themes } from '../../enum/Themes';

const testData = {
  description_summary: ['Test description'],
  name: ['Test Service'],
  name_override: ['Test Service Override'],
  name_synonyms: ['hh_kul'],
  units: [
    {
      address: {
        address_line1: ['Test Street 1'],
        country_code: ['FI'],
        locality: ['Helsinki'],
        postal_code: ['00100'],
      },
      id: '1',
      location: { lat: ['60.1695'], lon: ['24.9354'] },
      name: ['Unit 1'],
      'image.url': ['/test-image.jpg'],
    },
  ],
  url: ['https://example.com/service/1'],
};

describe('ResultCard.tsx', () => {
  it('Renders all expected texts', () => {
    render(
      <ResultCard
        description_summary={testData.description_summary}
        name={testData.name}
        name_synonyms={testData.name_synonyms}
        search_api_data_source={['entity:node']}
        search_api_id={['1']}
        search_api_language={['en']}
        units={testData.units}
        url={testData.url}
      />,
    );

    const { description_summary, name, name_synonyms, units } = testData;

    expect(screen.getByText(name.toString())).toBeTruthy();
    expect(screen.getByText(description_summary.toString())).toBeTruthy();
    name_synonyms.forEach((synonym) => {
      expect(screen.getByText(Themes.get(synonym) as string)).toBeTruthy();
    });
    expect(screen.getByText(units.length.toString())).toBeTruthy();
  });

  it('Renders override texts', () => {
    render(
      <ResultCard
        description_summary={testData.description_summary}
        name={testData.name}
        name_override={testData.name_override}
        search_api_data_source={['entity:node']}
        search_api_id={['1']}
        search_api_language={['en']}
        units={testData.units}
        url={testData.url}
      />,
    );
    const { name_override } = testData;
    expect(screen.getByText(name_override.toString())).toBeTruthy();
  });
});
