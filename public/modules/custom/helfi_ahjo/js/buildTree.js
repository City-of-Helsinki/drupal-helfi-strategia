(function ($, Drupal, drupalSettings, once) {
  Drupal.behaviors.buildTree = {
    attach: function (context, settings) {
      once('buildTree', 'html', context).forEach( function (element) {
        var editForm = function () {
          return false;
        }
        editForm.prototype.init = function (obj) {
          return false
        }

        editForm.prototype.show = function (node) {
          return false;
        }

        editForm.prototype.hide = function (showldUpdateTheNode) {
          return false
        }
        OrgChart.templates.ahjo = Object.assign({}, OrgChart.templates.ana);
        OrgChart.templates.ahjo.field_0 = '<text data-width="230" data-text-overflow="multiline" style="font-size: 16px;" fill="#ffffff" x="125" y="30" text-anchor="middle">{val}</text>';
        OrgChart.templates.ahjo.field_1 = '<text data-width="230" data-text-overflow="multiline" style="font-size: 16px;" fill="#ffffff" x="125" y="100" text-anchor="middle">{val}</text>';
        let chart = new OrgChart(document.getElementById("tree"), {
          layout: OrgChart.mixed,
          template: "ahjo",
          editUI: new editForm(),
          enableDragDrop: false,
          menu: {
            pdfPreview: {
              text: "PDF Preview",
              icon: OrgChart.icon.pdf(24, 24, '#7A7A7A'),
              onClick: preview
            },
            pdf: {text: "Export PDF"},
            png: {text: "Export PNG"},
            svg: {text: "Export SVG"},
            csv: {text: "Export CSV"}
          },
          searchDisplayField: "name",
          nodeBinding: {
            field_0: "name",
            field_1: "type"
          },
          nodes: drupalSettings.helfi_ahjo

        });

        function preview() {
          OrgChart.pdfPrevUI.show(chart, {
            format: 'A4'
          });
        }
      });
    }
  };
})(jQuery, Drupal, drupalSettings, once);
