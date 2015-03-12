'use strict';

var PLACEHOLDERTEXT = ["Edit mode must be enabled to edit the background image of a folder", "Click a folder to view/edit the URL"];
var EDITBUTTONTEXT = ["Enable Edit Mode", "Edit Mode Currently Enabled"];
var FOLDERCLASSES = ["folder", "folder draggable"];


/**
 * @ngdoc function
 * @name pictureProjectorApp.controller:ExplorerCtrl
 * @description
 * # ExplorerCtrl
 * Controller of the pictureProjectorApp
 */
 var app = angular.module('pictureProjectorApp');


 app.controller('ExplorerCtrl', function ($scope, itemMirror) {

    $scope.editMode = false;
    setText(+ $scope.editMode);

    // Toggle edit mode, change button text
    $scope.toggleEdit = function () {
      $scope.editMode = !$scope.editMode;
      setText(+ $scope.editMode);
    }

    // Sets the text and class of edit mode related items
    function setText (num) {
      $scope.placeholderText = PLACEHOLDERTEXT[num];
      $scope.editButtonText = EDITBUTTONTEXT[num];
      $scope.folderClass = FOLDERCLASSES[num];
      $scope.imageURLText = "";
    }


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

      // Organizes the associations into two groups/arrays, 
      // groupingItems and notGroupingItems.
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

      $scope.handleClick = function(assoc) {
        var editMode = $scope.editMode;
          if(editMode) {
            $scope.imageURLText = assoc.imageNSAttr;
          } else {
            navigate(assoc.guid);
          }
      }

      $scope.navigate = navigate;

      function navigate(guid) {
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

// // Directive to set the background image via css
// app.directive('backImg', function(){
//     return function(scope, element, attrs){
//         attrs.$observe('backImg', function(value) {
//             element.css({
//                 'background-image': 'url(' + value +')',
//                 'background-size' : 'cover'
//             });
//         });
//     };
// });