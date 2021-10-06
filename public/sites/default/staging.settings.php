<?php

$config['helfi_proxy.settings']['prefixes'] = [
  'en' => 'staging-decision-making',
  'fi' => 'staging-paatoksenteko-ja-hallinto',
  'sv' => 'staging-beslutsfattande-och-forvaltning',
  'ru' => 'staging-administration',
];
$config['openid_connect.settings.tunnistamo']['settings']['is_production'] = TRUE;
$config['helfi_proxy.settings']['tunnistamo_return_url'] = '/fi/staging-paatoksenteko-ja-hallinto/openid-connect/tunnistamo';

