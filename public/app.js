'use strict';

var app = angular.module('myApp', []);

app.controller('appController', ['$scope', '$http', 
	function($scope, $http) {

		$scope.init = function() {
			$scope.params = {
				name: 'UNIQ_NAME',
				url: 'https://list.tmall.com/search_product.htm?spm=a220m.1000858.0.0.d811797tlPESO&cat=50024556&s={{#PAGE}}&q=3d%B4%F2%D3%A1%BB%FA&sort=s&style=g&from=rs_1_key-top-s&type=pc#J_Filter',
				start: 0,
				end: 99
			};
			$scope.reset();
		};

		$scope.start = function() {
			$http.post('/start', $scope.params).then(function(response) {
			}, function(response) {
				alert('please try again');
				console.log(response);
			});
			$scope.reset();
		};

		$scope.reset = function() {
		};

		$scope.init();
	}]);