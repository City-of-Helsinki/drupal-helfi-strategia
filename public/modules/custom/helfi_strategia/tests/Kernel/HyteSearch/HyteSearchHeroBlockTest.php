<?php

declare(strict_types=1);

namespace Drupal\Tests\helfi_strategia\Kernel;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\helfi_strategia\Plugin\Block\HyteSearchHeroBlock;

/**
 * Kernel tests for HyteSearchHeroBlock.
 *
 * @group helfi_strategia
 */
class HyteSearchHeroBlockTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'block',
    'big_pipe',
    'helfi_strategia',
    'helfi_api_base',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->installEntitySchema('user');
    $this->installConfig(['system']);
  }

  /**
   * Tests the build() method of the hero block.
   */
  public function testBuildMethod(): void {
    $plugin_definition = ['provider' => 'helfi_strategia'];

    // Mock RouteMatchInterface.
    $routeMatch = $this->prophesize(RouteMatchInterface::class);
    $routeMatch->getRouteName()->willReturn('helfi_strategia.hyte_search');
    $this->container->set(RouteMatchInterface::class, $routeMatch->reveal());
    $block = HyteSearchHeroBlock::create($this->container, [], 'hyte_search_hero_block', $plugin_definition
    );

    $build = $block->build();

    $this->assertIsArray($build);
    $this->assertArrayHasKey('hyte_search_hero_block', $build);

    $content = $build['hyte_search_hero_block'];
    $this->assertArrayHasKey('#theme', $content);
    $this->assertEquals('hyte_search_hero_block', $content['#theme']);
    $this->assertEquals('Find wellbeing services', (string) $content['#hero_title']);
  }

  /**
   * Tests cache contexts.
   */
  public function testCacheContexts(): void {
    $plugin_definition = ['provider' => 'helfi_strategia'];

    $block = HyteSearchHeroBlock::create(
      $this->container,
      [],
      'hyte_search_hero_block',
      $plugin_definition
    );

    $contexts = $block->getCacheContexts();

    $this->assertContains('route', $contexts);
  }
}
