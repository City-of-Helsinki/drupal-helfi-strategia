import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import initSentry from '@/react/common/helpers/Sentry';
import { SearchContainer } from './containers/SearchContainer';

initSentry();

const ROOT_ID = 'hyte-search';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById(ROOT_ID);

  if (!rootElement) {
    throw new Error('Root id missing for Hyte Search React app');
  }

  const elasticUrl = rootElement.dataset.url;

  if (!elasticUrl) {
    throw new Error('Elastic URL missing for Hyte Search React app');
  }

  ReactDOM.render(
    <React.StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchContainer url={`${elasticUrl}/hyte/_search`} />
      </Suspense>
    </React.StrictMode>,
    rootElement,
  );
});
