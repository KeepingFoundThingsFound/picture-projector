'use strict';

/**
 * @ngdoc overview
 * @name pictureProjectorApp
 * @description
 * # pictureProjectorApp
 *
 * Main module of the application.
 */
angular
  .module('pictureProjectorApp', [
    'ngAnimate',
    'ng-context-menu',
    'angular-loading-bar',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/explorer', {
        templateUrl: 'views/explorer.html',
        controller: 'ExplorerCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
