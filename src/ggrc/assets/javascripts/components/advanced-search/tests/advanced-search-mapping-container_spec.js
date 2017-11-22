/*!
  Copyright (C) 2017 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

describe('GGRC.Components.advancedSearchMappingContainer', function () {
  'use strict';

  var viewModel;

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('advancedSearchMappingContainer');
  });

  describe('addMappingCriteria() method', function () {
    it('adds only criteria if list is empty', function () {
      var items;
      viewModel.attr('items', can.List());

      viewModel.addMappingCriteria();

      items = viewModel.attr('items');
      expect(items.length).toBe(1);
      expect(items[0].type).toBe('mappingCriteria');
    });

    it('adds operator and criteria if list is not empty', function () {
      var items;
      viewModel.attr('items',
        [GGRC.Utils.AdvancedSearch.create.mappingCriteria()]);
      viewModel.addMappingCriteria();

      items = viewModel.attr('items');
      expect(items.length).toBe(3);
      expect(items[0].type).toBe('mappingCriteria');
      expect(items[1].type).toBe('operator');
      expect(items[2].type).toBe('mappingCriteria');
    });
  });

  describe('createGroup() method', function () {
    it('transforms criteria to group with 2 criteria and operator inside',
    function () {
      var viewItems;
      viewModel.attr('items', new can.List([
        GGRC.Utils.AdvancedSearch.create.mappingCriteria({field: 'first'}),
        GGRC.Utils.AdvancedSearch.create.operator(),
        GGRC.Utils.AdvancedSearch.create.mappingCriteria({field: 'second'})
      ]));
      viewItems = viewModel.attr('items');

      viewModel.createGroup(viewItems[0]);

      expect(viewItems.length).toBe(3);
      expect(viewItems[0].type).toBe('group');
      expect(viewItems[1].type).toBe('operator');
      expect(viewItems[2].type).toBe('mappingCriteria');
      expect(viewItems[0].value.length).toBe(3);
      expect(viewItems[0].value[0].type).toBe('mappingCriteria');
      expect(viewItems[0].value[0].value.field).toBe('first');
      expect(viewItems[0].value[1].type).toBe('operator');
      expect(viewItems[0].value[2].type).toBe('mappingCriteria');
    });
  });
});
