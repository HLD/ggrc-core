/*!
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../tasks-counter/tasks-counter';
import logo from '../../../images/ggrc-logo.svg';
import oneColorLogo from '../../../images/ggrc-one-color.svg';

(function (GGRC, can) {
  'use strict';
  var colorsMap = {
    System: 'header-style-1',
    Process: 'header-style-1',
    DataAsset: 'header-style-1',
    Product: 'header-style-1',
    Project: 'header-style-1',
    Facility: 'header-style-1',
    Market: 'header-style-1',
    Audit: 'header-style-2',
    Assessment: 'header-style-2',
    Issue: 'header-style-3',
    Risk: 'header-style-3',
    Threat: 'header-style-3',
    Regulation: 'header-style-4',
    Policy: 'header-style-4',
    Standard: 'header-style-4',
    Contract: 'header-style-4',
    Clause: 'header-style-4',
    Section: 'header-style-4',
    Control: 'header-style-4',
    Objective: 'header-style-4',
    Program: 'header-style-5'
  };

  var template = can.view(GGRC.mustache_path +
    '/components/page-header/page-header.mustache'
  );
  var viewModel = can.Map.extend({
    define: {
      isMyAssessments: {
        type: Boolean,
        get: function () {
          return GGRC.Utils.CurrentPage.isMyAssessments();
        }
      },
      showTitles: {
        type: Boolean,
        value: true
      },
      model: {
        get: function () {
          return this.attr('instance').class;
        }
      },
      instance: {
        get: function () {
          return GGRC.page_instance();
        }
      },
      current_user: {
        get: function () {
          return GGRC.current_user;
        }
      },
      headerStyle: {
        type: 'string',
        get: function () {
          return colorsMap[this.attr('instance.type')] || '';
        }
      },
      logo: {
        type: 'string',
        get: function () {
          return this.attr('headerStyle') ? oneColorLogo : logo;
        },
      },
    },
    showHideTitles: function (element) {
      var elWidth = element.width();
      var $menu = element.find('.menu');
      var $title = element.find('h1');

      this.attr('showTitles', true);

      if (elWidth < ($menu.width() + $title.width())) {
        this.attr('showTitles', false);
      } else {
        this.attr('showTitles', true);
      }
    }
  });

  GGRC.Components('pageHeader', {
    tag: 'page-header',
    template: template,
    viewModel: viewModel,
    events: {
      '{window} resize': _.debounce(function () {
        this.viewModel.showHideTitles(this.element);
      }, 100),
      inserted: function () {
        this.viewModel.showHideTitles(this.element);
      }
    }
  });
})(window.GGRC, window.can);
