<?php

declare(strict_types=1);

namespace src\Kernel\HyteSearch;

use Drupal\Core\Url;
use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\helfi_api_base\Traits\ApiTestTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunClassInSeparateProcess;

/**
 * Tests hyte search controller.
 */
#[Group('helfi_strategia')]
#[RunClassInSeparateProcess]
class HyteSearchControllerTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'helfi_strategia',
    'helfi_api_base',
  ];

  use ApiTestTrait;
  use UserCreationTrait;

  /**
   * Tests search controller.
   */
  public function testController(): void {
    $this->installEntitySchema('user');
    $this->setUpCurrentUser(permissions: ['access content']);

    $request = $this->getMockedRequest(Url::fromRoute('helfi_strategia.hyte_search', [
      'org' => '00400',
    ])->toString());
    $response = $this->processRequest($request);
    $this->assertEquals(200, $response->getStatusCode());
  }

}
