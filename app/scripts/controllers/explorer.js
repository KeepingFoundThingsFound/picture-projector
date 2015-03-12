'use strict';

/**
 * @ngdoc function
 * @name pictureProjectorApp.controller:ExplorerCtrl
 * @description
 * # ExplorerCtrl
 * Controller of the pictureProjectorApp
 */
 angular.module('pictureProjectorApp')
 .controller('ExplorerCtrl', function ($scope, itemMirror) {
  	// starts everything up after dropbox loads
  	var init = itemMirror.initialize;
  	init.then(function() {
      $scope.mirror = itemMirror;
      $scope.associations = itemMirror.associations;
      getGroupingItems();

      // This needs to be called after the service updates the associations.
      // Angular doesn't watch the scope of the service's associations, so any
      // updates don't get propogated to the front end.
      function assocScopeUpdate() {
        $scope.associations = itemMirror.associations;
        getGroupingItems();
      }

      function getGroupingItems() {
        $scope.groupingItems = [];
        $scope.notGroupingItems = [];
        for(var i = 0; i < itemMirror.associations.length; i++) {
          var assoc = itemMirror.associations[i];
          if(assoc.isGrouping) {
            $scope.groupingItems.push(assoc);
          } else {
            $scope.notGroupingItems.push(assoc);
          }
        }
      }

      $scope.deleteAssoc = function(guid) {
        itemMirror.deleteAssociation(guid).
        then(assocScopeUpdate);
      };

      $scope.navigate = function(guid) {
        itemMirror.navigateMirror(guid).
        then(assocScopeUpdate);
      };

      $scope.previous = function() {
        itemMirror.previous().
        then(assocScopeUpdate);
      };

      $scope.isGrouping = function(assoc) {
        return assoc.isGrouping;
      }
    });
});
