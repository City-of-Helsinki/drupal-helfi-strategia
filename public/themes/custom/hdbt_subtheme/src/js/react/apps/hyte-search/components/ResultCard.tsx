// biome-ignore-all lint/correctness/useJsxKeyInIterable: @todo UHF-12501
// biome-ignore-all lint/style/noNonNullAssertion: @todo UHF-12501
import { IconLocation } from 'hds-react';
import { Themes } from 'src/js/react/enum/Themes';
import type TagType from '@/common/types/TagType';
import CardItem, { Metarow } from '@/react/common/Card';
import type { Service } from '../types/Service';

export const ResultCard = ({
  description_summary,
  name,
  name_override,
  name_synonyms,
  units,
  url,
}: Service) => {
  const getUnits = () => {
    if (!units?.length) {
      return [];
    }

    return [
      <Metarow
        content={units.length.toString()}
        icon={<IconLocation />}
        label={`${Drupal.t('Locations', {}, { context: 'Hyte search' })}`}
      />,
    ];
  };

  const getTags = (): TagType[] => {
    /** @todo implement better once BE changes are made */
    const foundThemes = name_synonyms
      ?.toString()
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => Themes.has(tag));

    if (!foundThemes?.length) {
      return [];
    }

    return foundThemes.map((theme: string) => ({ tag: Themes.get(theme)! }));
  };

  const getImage = (): JSX.Element | undefined => {
    if (!units?.[0]?.['image.url']) {
      return;
    }

    const srcSet = units[0]?.['image.variants.1.5_1022w_682h_LQ']
      ? `${units[0]?.['image.variants.1.5_1022w_682h_LQ']} 2x`
      : undefined;

    return (
      <img
        alt={units[0]?.['image.alt']?.toString() || ''}
        data-photographer={units[0]?.['image.photographer']?.toString() || ''}
        className='card__image'
        src={units[0]?.['image.url']?.[0]}
        srcSet={srcSet}
        title={units[0]?.['image.title']?.toString() || ''}
      />
    );
  };

  return (
    <CardItem
      cardDescription={description_summary?.toString()}
      cardImage={getImage()}
      cardTags={getTags()}
      cardTitle={name_override?.toString() || name.toString()}
      cardUrl={url.toString()}
      customMetaRows={{ top: getUnits() }}
    />
  );
};
