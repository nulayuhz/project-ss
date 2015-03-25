'use strict';

/**
 * @ngdoc function
 * @name projectSsApp.controller:FloorplanCtrl
 * @description
 * # FloorplanCtrl
 * Controller of the projectSsApp
 */
angular.module('projectSsApp')
.controller('FloorplanCtrl', function ($scope, floorPlanService) {
	$scope.myDesks = [
		{
			deskID: 0,
		y: 10,
			x: 10
		}, {
			deskID: 1,
		y: 20,
			x: 20
		}, {
			deskID: 2,
		y: 50,
			x: 130
		}, {
			deskID: 3,
		y: 60,
			x: 150
		}, {
			deskID: 4,
		y: 40,
			x: 140
		}, {
			deskID: 5,
		y: 250,
			x: 250
		}, {
			deskID: 6,
		y: 90,
			x: 160
		}, {
			deskID: 7,
		y: 100,
			x: 190
		}, {
			deskID: 8,
		y: 50,
			x: 500
	}];

	$scope.getEmployees = function () {
		$scope.employees = floorPlanService.getEmployees();
	};

	$scope.updateEmployees = function () {
		floorPlanService.updateEmployees();
	};

	$scope.editMode = false;
	$scope.editDesks = function () {
		$scope.editMode = !$scope.editMode;
		$scope.$broadcast("editDeskPosition", $scope.editMode);
	};

	$scope.addMode = false;
	$scope.addDesk = function () {
		$scope.myDesks.push({
			deskID : Math.floor(Math.random() * 12345),
			y : 500,
			x : 500
		});
		$scope.editMode = false; //switch off edit mode
		$scope.addMode = !$scope.addMode;
		$scope.$broadcast('addDesk', {
			desks: $scope.myDesks,
			addMode: $scope.addMode
		});
	};

	$scope.removeDesk = function () {
		// $scope.myDesks
	};
	$scope.getEmployees();
});
