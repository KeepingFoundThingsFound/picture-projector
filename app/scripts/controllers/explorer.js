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

    // Parses the URL for background images
    $scope.parseURL = function(url) {
      var result;

      if(!url) {
        var url = 'images/folder.png';
      }
      return 'url(' + url + ')';
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
            $scope.select(assoc);
          } else {
            navigate(assoc.guid);
          }
      };

      $scope.navigate = navigate;

      function navigate(guid) {
        itemMirror.navigateMirror(guid).
        then(assocScopeUpdate);
      };

      $scope.previous = function() {
        itemMirror.previous().
        then(assocScopeUpdate);
      };

      $scope.save = function() {
        itemMirror.save().
        then(assocScopeUpdate);
      };

      $scope.refresh = function() {
        itemMirror.refresh().
        then(assocScopeUpdate);
      };

      $scope.isGrouping = function(assoc) {
        return assoc.isGrouping;
      };

      // Only one association is ever selected at a time. It has the boolean
      // selected property, to allow for unique styling
      $scope.select = function(assoc) {
        if ($scope.selectedAssoc) {
          $scope.selectedAssoc.selected = false;
        }
        $scope.selectedAssoc = assoc;
        $scope.selectedAssoc.selected = true;
      };

      // Phantom Creation Section
      $scope.phantomRequest = {
        displayText: null,
        itemURI: null,
        localItemRequested: false
      };

      $scope.createPhantom = function() {
        itemMirror.createAssociation($scope.phantomRequest).
        then(assocScopeUpdate);
      };

      // Folder Creation Section
      $scope.folderRequest = {
        displayText: null,
        localItem: null,
        isGroupingItem: true
      };

      $scope.createFolder = function() {
        itemMirror.createAssociation($scope.folderRequest).
        then(assocScopeUpdate);
      };

      // default section for our editing panel
      $scope.editSection = 'assoc-editor';

      // Function used to show display text succinctly
      $scope.matchFirstLn = function(str) {
        var first = /.*/;
        return first.exec(str)[0];
      };
    });

// target elements with the "draggable" class
interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },

    // call this function on every dragmove event
    onmove: function (event) {
      var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the position attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },
    // call this function on every dragend event
    onend: function (event) {
      var textEl = event.target.querySelector('p');

      textEl.textContent = event.x;
       
    }
  });
});
