/**
 * @file
 */

(function ($, Drupal, drupalSettings) {
  'use strict';
  $(document).ready(function () {
    $('.menu-item.menu-item--expanded').each(function (i, obj) {
      let self = $(this);
      if (self.find('a.active').length) {
        self.addClass('active');

        if (drupalSettings.interactiveParentMenu) {
          if (!self.hasClass('menu-item--active')) {
            self.children('i').toggleClass('arrow-right arrow-down');
          }
        }
      }
    });

    $('.hierarchical-taxonomy-tree .menu-item--expanded > a').on('click', function (e) {
      e.preventDefault();
      $(this).find('i').toggleClass('arrow-right arrow-down');
      let isChildVisible = $(this).parent().children('.menu').is(':visible');
      if (isChildVisible) {
        $(this).parent().children('.menu').slideUp();
        $(this).parent().removeClass('active');
      }
      else {
        $(this).parent().children('.menu').slideDown();
        $(this).parent().addClass('active');
      }
    });

  });
})(jQuery, Drupal, drupalSettings);
