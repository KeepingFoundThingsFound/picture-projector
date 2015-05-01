'use strict';

var PLACEHOLDERTEXT = ["Edit mode must be enabled to edit the background image of a folder", "Click a folder to view/edit the URL"];
var EDITBUTTONTEXT = ["Edit", "Edit Mode Currently Enabled"];
var FOLDERCLASSES = ["folder", "folder draggable"];


/**
* @ngdoc function
* @name pictureProjectorApp.controller:ExplorerCtrl
* @description
* # ExplorerCtrl
* Controller of the pictureProjectorApp
*/
var app = angular.module('pictureProjectorApp');

// Sets the default configuration for growl messages
app.config(['growlProvider', function (growlProvider) {
  growlProvider.globalTimeToLive(3000);
  growlProvider.globalDisableCountDown(true);
  growlProvider.onlyUniqueMessages(false);
}]);

// Main controller for the explorer app
app.controller('ExplorerCtrl', function ($scope, growl, itemMirror) {

  // Initialize edit mode and set the default text 
  $scope.editMode = false;
  setText(+ $scope.editMode);

  // Set to false after printing associations for the first time
  var firstTransform = true;

  $scope.repeatEnd = function() {
    firstTransform = false;
  }


  function savedGrowl() {
    var config = {};
     growl.success("Changes saved.", config);
  }

  // Toggle edit mode, change button text, saves changes
  $scope.toggleEdit = function () {
    // Save our changes we made to ItemMirror
    if($scope.editMode) {
      $scope.save();
    }
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

    // Navigates to the requested guid
    $scope.navigate = function(guid) {
      itemMirror.navigateMirror(guid).
      then(assocScopeUpdate);
    };

    // Checks to see if edit mode is disabled before navigating
    $scope.handleAssocNavigate = function(assoc) {
      var editMode = $scope.editMode;
      if(!editMode) {
        $scope.navigate(assoc.guid);
      }
    };

    // Selects the sent association to be later edited
    $scope.handleAssocSelect = function(assoc) {
        $scope.imageURLText = assoc.customPicture;
        $scope.select(assoc);
    }

    // Handles the placement styling of the different associations
    $scope.handleAssocStyle = function(assoc) {
      var result = new Object();

      // result['background-image'] = $scope.parseURL(assoc.customPicture);
      result['position'] = 'relative';

      // Case for placing items with custom cords for the first time
      if(assoc.xCord && assoc.yCord) {
        // if(!assoc.firstY) {
        //   assoc.firstY = assoc.yCord;
        //   assoc.firstX = assoc.xCord;
        // }
        result['left'] = assoc.xCord + 'px';
        result['top'] = assoc.yCord + 'px';
        result['position'] = 'absolute';
      }

      return result;
    };

    // Deletes the given association
    $scope.deleteAssoc = function(guid) {
      itemMirror.deleteAssociation(guid).
      then(assocScopeUpdate);
    };

  
    // Navigates the previously called assocation
    // Always the parent in our case
    $scope.previous = function() {
      itemMirror.previous().
      then(assocScopeUpdate);
    };

    // Saves the current associations and their attributes
    $scope.save = function() {
      itemMirror.save().
      then(assocScopeUpdate).
      then(savedGrowl());
    };

    // Refreshes the itemMirror object
    $scope.refresh = function() {
      itemMirror.refresh().
      then(assocScopeUpdate);
    };

    // Checks if the association is a grouping object (folder) or not
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

    // Sets the CSS position attribute to relative if an association 
    // doesn't have a custom x or y coordinate.

    // There is a special case of an association being transformed (dragged) during this
    // session. We let interact.js handle the transformations and simply store the
    // new coordinates. Next refresh we will place the association at the new
    // coordinates.
    $scope.checkPosition = function(assoc) {
      if(assoc.xCord && assoc.yCord && firstTransform) {
        return "absolute";
      } else {
        return "relative";
      }
    };

    // INTERACT.JS - draggable related code
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
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
          // var xCord = event.target.getAttribute('data-x');
          // var yCord = event.target.getAttribute('data-y');

          // var xCord = event.target.offsetLeft;
          // var yCord = event.target.offsetTop;

          var rect = getOffsetRect(event.target);
          $scope.offsetLeft = 'Offset left: ' + rect.left;
          $scope.offsetTop = 'Offset top: ' + rect.top;

          $scope.selectedAssoc.xCord = rect.left;
          $scope.selectedAssoc.yCord = rect.top;

          $scope.selectedAssoc.moved = true;

          $scope.save();
        }
      });

      function dragMoveListener (event) {
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
      }

  });

  // Gets the offset of the provided element relative to the canvas and current scroll
  function getOffsetRect(elem) {
    var box = elem.getBoundingClientRect();
    
    var body = document.body;
    var docElem = document.documentElement;
    var canvasRect = document.getElementById('canvas').getBoundingClientRect();
    
    // Client scroll
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    
    var top  =  box.top - clientTop - canvasRect.top;
    var left = box.left - clientLeft - canvasRect.left;
    
    return { top: Math.round(top), left: Math.round(left) }
}

});

// Custom directive to set the background image of an association.
app.directive('backImg', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
          if(value == "") { value = 'images/folder.png'};
            element.css({
                'background-image': 'url(' + value +')',
                'background-size' : 'cover'
            });
        });
    };
});

