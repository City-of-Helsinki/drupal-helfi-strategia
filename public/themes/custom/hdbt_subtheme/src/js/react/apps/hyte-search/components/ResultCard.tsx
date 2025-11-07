import { IconLocation } from 'hds-react';
import { Service } from '../types/Service';

import CardItem, { Metarow } from '@/react/common/Card';
import TagType from '@/common/types/TagType';
import { Themes } from 'src/js/react/enum/Themes';

export const ResultCard  = ({
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

    return [<Metarow
      content={units.length.toString()}
      icon={<IconLocation />}
      label={`${Drupal.t('Locations', {}, { context: 'Hyte search' })}`}
    />];
  }

  const getTags = (): TagType[] => {
    /** @todo implement better once BE changes are made */
    const foundThemes = name_synonyms?.toString().split(',').map((tag) => tag.trim()).filter((tag) => Themes.has(tag));

    if (!foundThemes?.length) {
      return [];
    }

    return foundThemes.map((theme: string) => ({
      tag: Themes.get(theme)!,
    }));
  };

  return <CardItem
    cardDescription={description_summary?.toString()}
    cardTags={getTags()}
    cardTitle={name_override?.toString() || name.toString()}
    cardUrl={url.toString()}
    customMetaRows={{
      top: getUnits(),
    }}
  />;
};
