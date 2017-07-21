'use strict';

var app = angular.module('myApp', []);

app.controller('appController', ['$scope', '$http', 
	function($scope, $http) {

		$scope.init = function() {
			$scope.reset();
		};

		$scope.start = function() {
			var params = {};
			$http.post('/start', params).then(function(response) {
			}, function(response) {
				console.log(response);
			});
			$scope.reset();
		};

		$scope.reset = function() {
		};

		$scope.init();
	}]);