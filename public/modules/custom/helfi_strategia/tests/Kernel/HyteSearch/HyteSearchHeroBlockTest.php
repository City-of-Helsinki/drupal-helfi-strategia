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
    $plugin_definition = [
      'provider' => 'helfi_strategia',
    ];

    $routeMatch = $this->prophesize(RouteMatchInterface::class);
    $routeMatch->getRouteName()->willReturn('helfi_strategia.hyte_search.fi');
    $this->container->set(RouteMatchInterface::class, $routeMatch->reveal());

    /** @var \Drupal\helfi_strategia\Plugin\Block\HyteSearchHeroBlock $block */
    $block = HyteSearchHeroBlock::create(
      $this->container,
      [],
      'hyte_search_hero_block',
      $plugin_definition
    );

    $build = $block->build();

    // Structure checks.
    $this->assertIsArray($build);
    $this->assertArrayHasKey('hyte_search_hero_block', $build);

    $content = $build['hyte_search_hero_block'];

    // Assert theme hook.
    $this->assertArrayHasKey('#theme', $content);
    $this->assertEquals('hyte_search_hero_block', $content['#theme']);
    // Assert expected variables exist.
    $this->assertArrayHasKey('#hero_title', $content);
    $this->assertArrayHasKey('#hero_description', $content);

    // Assert expected values.
    $this->assertEquals('Your hero title', (string) $content['#hero_title']);
    $this->assertEquals(
      'Your hero description here.',
      (string) $content['#hero_description']
    );
  }

  /**
   * Tests cache contexts.
   */
  public function testCacheContexts(): void {
    $plugin_definition = [
      'provider' => 'helfi_strategia',
    ];

    /** @var \Drupal\helfi_strategia\Plugin\Block\HyteSearchHeroBlock $block */
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
