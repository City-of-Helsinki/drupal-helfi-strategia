<?php

declare(strict_types=1);

namespace Drupal\Tests\helfi_strategia\Kernel;

use Drupal\KernelTests\KernelTestBase as CoreKernelTestBase;

/**
 * Base class for kernel tests.
 */
abstract class KernelTestBase extends CoreKernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'helfi_strategia',
    'helfi_api_base',
    'csp',
  ];

}
