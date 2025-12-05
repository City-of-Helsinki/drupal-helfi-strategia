import { Themes } from 'src/js/react/enum/Themes';
import type TagType from '@/common/types/TagType';
import CardItem, { Metarow } from '@/react/common/Card';
import type { Service, Unit } from '../types/Service';
import { getElasticUrlAtom } from '../store';
import { useAtomValue } from 'jotai';

declare const ELASTIC_DEV_URL: string | undefined;

export const ResultCard = ({
  description_summary,
  name,
  name_override,
  name_synonyms,
  units,
  url,
}: Service & { units: Unit[] }) => {
  const elasticUrl = useAtomValue(getElasticUrlAtom);

  const getUnits = () => {
    if (!units?.length) {
      return [];
    }

    return [
      <Metarow
        content={units.length.toString()}
        icon={<span className='hel-icon hel-icon--location' />}
        label={`${Drupal.t('Locations', {}, { context: 'Hyte search' })}`}
        key='location'
      />,
    ];
  };

  const getTags = (): TagType[] => {
    const foundThemes = name_synonyms
      ?.map((tag) => tag.trim())
      .filter((tag) => Themes.has(tag));

    if (!foundThemes?.length) {
      return [];
    }

    return foundThemes.map((theme: string) => ({ tag: Themes.get(theme) }));
  };

  // For ease-of-testing, makes test environment images work
  const enrichImageUrl = (imageUrl: string): string => {
    if (
      typeof ELASTIC_DEV_URL !== 'undefined' &&
      elasticUrl.includes('arodevtest') &&
      !/^https?:\/\//i.test(imageUrl)
    ) {
      return `https://www.test.hel.ninja${imageUrl}`;
    }
    return imageUrl;
  };

  const getImage = (): JSX.Element | undefined => {
    if (!units?.[0]?.['image.url']) {
      return;
    }

    const srcSet = units[0]?.['image.variants.1.5_1022w_682h_LQ']
      ? `${enrichImageUrl(units[0]?.['image.variants.1.5_1022w_682h_LQ'].toString())} 2x`
      : undefined;

    return (
      <img
        alt={units[0]?.['image.alt']?.toString() || ''}
        data-photographer={units[0]?.['image.photographer']?.toString() || ''}
        className='card__image'
        src={enrichImageUrl(units[0]?.['image.url']?.[0])}
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
