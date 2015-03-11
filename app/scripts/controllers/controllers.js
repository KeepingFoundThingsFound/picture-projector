'use strict'

var app = angular.module('pictureProjectorApp');

// Controller to control active navbar
app.controller('HeaderController', HeaderController);


function HeaderController($scope, $location) {
	$scope.isActive = function(viewLocation) {
		return viewLocation === $location.path();
	};
}