'use strict';
/**
 * @ngdoc directive
 * @name projectSsApp.directive:floorMap
 * @description
 * # floorMap
 */
angular.module('projectSsApp')
.directive('floorMap', function () {

	var margin = {top: -5, right: -5, bottom: -5, left: -5},
		width = 1500 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom,
		movex, movey,
		dragStep = 10;

	return {
	restrict: 'E',
	link: function (scope, element, attr) {
		var initialized = false,
			selectedDesk = {},
			desks,
			deskRects,
			deskRectsID,
			deskHandles;

		var dragstarted = function (d) {
			d3.event.sourceEvent.stopPropagation();
			// this.parentNode.appendChild(this); //this changes rendering order by re-appending the elemnt to the end
			d3.select(this).select('rect')
				.classed('drag', true)
				// .transition()
				// .ease("elastic")
				// .duration(500)
			scope.hideEditBox();
		};
		var dragged = function (d) {
			// d.x += d3.event.dx || 0;
			// d.y += d3.event.dy || 0;
			// movex = Math.round(d.x / dragStep) * dragStep;
			// movey = Math.round(d.y / dragStep) * dragStep;
			// d3.select(this).attr("transform", "translate(" + movex + "," + movey + ")");
			// console.log('dragging 2', d.x, d.y, d3.event.dx, d3.event.dy);
			d.x = d3.event.x;
			d.y = d3.event.y;
			d3.select(this).attr("transform", "translate(" + d.x+ "," +  d.y + ")");
		};
		var dragended = function (d) {
			d3.select(this).select('rect').classed('drag', false)
			// d.x = movex || d.x;
			// d.y = movey || d.y;
			
			if (scope.isEditBoxOpened) {
				scope.showEditBox(d.x, d.y);
			} else {
				// scope.updateCursorPos(d.x, d.y);
			}
			scope.$apply(); //apply on drag end instead of on drag
			
		};

		var drag = d3.behavior.drag();
		// set up initial svg object
		var svg = d3.selectAll(element)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.on('click', function () {
				if (d3.event.defaultPrevented) return;
				console.log('click on svg');
				scope.hideEditBox();
			});
		svg.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.right + ')')
			// .call(zoom);
		
		// gridlines
		var grid = svg.append('g').attr('class', 'grid');
		grid.append('g')
			.attr('class', 'x axis')
			.selectAll('line')
			.data(d3.range(0, width, 10))
			.enter().append('line')
			.attr('x1', function(d) { return d; })
			.attr('y1', 0)
			.attr('x2', function(d) { return d; })
			.attr('y2', height);
		grid.append('g')
			.attr('class', 'y axis')
			.selectAll('line')
			.data(d3.range(0, height, 10))
			.enter().append('line')
			.attr('x1', 0)
			.attr('y1', function(d) { return d; })
			.attr('x2', width)
			.attr('y2', function(d) { return d; });
		var desksContainer = svg.append('g').attr('class', 'desks-container');
		
		function addRotateBox(x,y) {
			var startx = x;
			var starty = y;
			var boxWidth = 40;
			var boxHeigth = 60;
			var lineData = [
				{x: startx,y: starty},
				{x: startx + boxWidth, y: starty},
				{x: startx + boxWidth, y: starty + boxHeigth},
				{x: startx, y: starty + boxHeigth}
			];
			var line = d3.svg.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
				.interpolate("linear");
			var lineStartX = startx + 20;
			var lineStartY = starty;
			var lineEndX = lineStartX;
			var lineEndY = lineStartY - 15;
			svg.append('path').attr('class', 'dashed').attr('d', line(lineData));
			svg.append('path').attr('class', 'solid').attr('d', 'M '+ lineStartX+ ' ' + lineStartY + ' L '+ lineEndX + ' ' + lineEndY);
			svg.append('circle').attr('class', 'drag-dot').attr('r', 4).attr('cx', lineEndX).attr('cy', lineEndY);
		}
		var init = function(value){
			console.log('init');
			initialized = true;
			desks = desksContainer.selectAll('g')
				.data(value).enter()
					.append('g')
					.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
					
			deskRects = desks.append('rect')
				.attr('class', 'points')
				.attr('width', 40)
				.attr('height', 60)
				.attr('fill', function () {
					return '#'+Math.floor(Math.random()*16777215).toString(16);
				})
				.on('mouseover', function(d){
					var nodeSelection = d3.select(this).style({opacity:'0.8'});
				})
				.on('mouseleave', function (d) {
					var nodeSelection = d3.select(this).style({opacity:'1'});
				})
				.on('click', function (d) {
					if (d3.event.defaultPrevented) return;
					d3.event.stopPropagation(); //prevent bubbling up
					selectedDesk = d;
					if (scope.editMode) {
						scope.showEditBox(d.x, d.y);
					}

					addRotateBox(d.x, d.y);
				})
	
				.on('blur', function (d) {
					if (d3.event.defaultPrevented) return;
					d3.select(this).attr('fill', function (d) {
						return '#'+Math.floor(Math.random()*16777215).toString(16);
					});
				});

			deskRectsID = desks.append('text')
				.text(function (d) {
					return d.deskID;
				})

			// deskHandles = desks.append('circle')
			// 	.attr('r', 5)
			// 	.style({opacity: '0'});
		};

		scope.$watch(attr.desksData, function(newValue, oldValue){
			if (!initialized) {
				init(newValue);
			}
			if (newValue.length !== oldValue.length) {
				init(newValue);
			}
		}, true);

		scope.$on('editDeskPosition', function (event, args) {
			if (args) {
				drag.origin(function (d) {
					return d;
				}).on('dragstart', dragstarted)
					.on('drag', dragged)
					.on('dragend', dragended);
				desks.call(drag)
				// .on('mouseover', function (d) {
				// 	var nodeSelection = d3.select(this).select('circle').style({opacity: '1'});
				// })
				// .on('mouseleave', function (d) {
				// 	var nodeSelection = d3.select(this).select('circle').style({opacity: '0'});
				// });
			} else {
				drag.origin(function (d) {
					return d;
				}).on('dragstart', null)
					.on('drag', null)
					.on('dragend', null);
				desks.call(drag)
				// .on('mouseover', function (d) {
				// 	var nodeSelection = d3.select(this).select('circle').style({opacity: '0'});
				// })
				// .on('mouseleave', function (d) {
				// 	var nodeSelection = d3.select(this).select('circle').style({opacity: '0'});
				// });
			}
		});

		scope.$on('addDesk', function (event, args) {
			if(args.addMode) {
				//
			}
		});

	}
}});
