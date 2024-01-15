// Used in control*.html

var data = []   // This variable is being used by other sources
var lines = []  // This variable is being used by other sources
/*
	This function will be called in control1,2,3,4 .html to run this js file
	It replaces the second chart.js that was necessary for lab1
 */
var leftButton = $("#left_button")
var rightButton = $("#right_button")
var leftInput = $('#left_input')
var rightInput = $('#right_input')

function runChartJs(durationDelta=20, limit_=300, interp='cardinal') {
	// Werte des graphen aktualisieren
	this.changeGraph = function(_callback){ // make this function accessible outside of the outer function
		var left = parseInt(leftButton.val())  // ausgewählte Einheit lesen, links an der Legende
		var right = parseInt(rightButton.val())  // ausgewählte Einheit lesen, rechts an der Legende

		// maximale und minimale graph höhe festlegen
		// domain() default liegt zwischen 0 und 1
		$("#left_max").val(scales[left].domain()[1]) 
		$("#left_min").val(scales[left].domain()[0]) 
		$("#right_max").val(scales[right].domain()[1]) 
		$("#right_min").val(scales[right].domain()[0]) 

		// Graph Axen einstellen
		Left_axis.call(d3.svg.axis().scale(scales[left]).orient('left').ticks(5)) 
		Right_axis.call(d3.svg.axis().scale(scales[right]).orient('right').ticks(5)) 
		_callback() 
	}

	// Aktualisiere Graphen mit den neuen Werten für max,min left und right
	// Left und right (max, min) sind veränderbar und können per Hand eingetragen werden
	function update() {
		let leftMax = parseFloat(document.getElementById("left_max").value)
		let leftMin = parseFloat(document.getElementById("left_min").value)
		let rightMax = parseFloat(document.getElementById("right_max").value)
		let rightMin = parseFloat(document.getElementById("right_min").value)

		let left = parseInt(leftButton.val())
		let right = parseInt(rightButton.val())

		scales[left].domain([leftMin, leftMax])
		Left_axis.call(d3.svg.axis().scale(scales[left]).orient('left').ticks(5)) 
		scales[right].domain([rightMin, rightMax]) 
		Right_axis.call(d3.svg.axis().scale(scales[right]).orient('right').ticks(5)) 
	}

	// This function handles the shifting of the x-axis
	function tick() {
		now = new Date() 
		let i = 0
		data.forEach(function (da) {
			da.data.push(da.value) 
			da.path.attr('d', lines[i]) 
			i++ 
		}) 
		// Shift domain
		x.domain([now - (limit + 0) * duration, now - duration]) 

		// Slide x-axis left
		axis.transition()
			.duration(duration)
			.ease('linear')
			.call(x.axis) 

		// Slide paths left
		paths.attr('transform', null)
			.transition()
			.duration(duration - durationDelta)
			.ease('linear')
			.attr('transform', 'translate(' + x(now - (limit + 1) * duration) + ')')
			.each('end', tick) 

		// Remove oldest data points
		data.forEach(function (da) {
			da.data.shift() 
		}) 
	}


	var margin = {top: 30, right: 55, bottom: 30, left: 55}
	var limit = limit_ * 1, // limits the x_axis and y_axis to a specific area and specific values
		duration = 100,
		now = new Date(Date.now() - duration)
	var width = Math.round(rightInput.position().left - (leftInput.position().left + leftInput.width())),
		chartwidth = width - margin.left - margin.right,
		chartheight = 1.0 * (300 - margin.top - margin.bottom) 
	$('#realtimegraph').width(width) 


	// The colors variable is defined outside of charts.js in control .html
	// colors display the color of the Units of the chart 
	colors.forEach(function (col) {
		data.push({
			value: 0,
			color: col,
			data: d3.range(limit).map(function () {
				return 0 
			})
		}) 
	}) 


	// Determine how the x axis should look like, its range(range) and labels(domain)
	var x = d3.time.scale()
		.domain([now - (limit - 0) * duration, now - 10])
		.range([0, chartwidth]) 

	// Dertermine how to scale the values within the given range
	var scales = []
	ranges.forEach(function (ran) {
		scales.push(d3.scale.linear()
			.domain(ran)
			.range([chartheight, 0])) 
	}) 

	// Determine how the graph line should look like
	scales.forEach(function (sca) {
		lines.push(d3.svg.line()
			.interpolate(interp)
			.x(function (d, i) {
				return (x(now - (limit + 1 - i) * duration) + margin.left) 
			})
			.y(function (d) {
				return (sca(d) + margin.top) 
			})) 
	}) 

	// setup chart and it's attr's
	var svg = d3.select('#realtimegraph').append('svg')
		.attr('class', 'chart')
		.attr('width', '100%')
		.attr('height', '300px') 

	var rtg = svg.append('g')
		.attr('transform', "translate(" + (margin.left) + "," + margin.top + ")") 

	var axis = rtg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + chartheight + ')')
		.call(x.axis = d3.svg.axis().scale(x).orient('bottom')) 

	var Right_axis = rtg.append('g')
		.attr('class', 'y axis')
		.attr("transform", "translate(" + (chartwidth + 3) + " ,0)")
		.call(d3.svg.axis().scale(scales[4]).orient('right').ticks(5)) 

	var Left_axis = rtg.append('g')
		.attr('class', 'y axis')
		.attr("transform", "translate(-3,0)")
		.call(d3.svg.axis().scale(scales[1]).orient('left').ticks(5)) 

	var paths = svg.append('g')


	for (var index in data) {
		var group = data[index]
		group.path = paths.append('path')
			.data([group.data])
			.attr('class', 'group')
			.attr('id', 'data' + String(index))
			.style('stroke', group.color)
			.style('opacity', 0) 
	}

	$('.dd_axis').each(function () {
		$('#data' + String($(this).val())).css("opacity", 1) 
	}) 

	update() 
	tick() 

	// If Enter-Key is released call update function
	$(document).ready(function () {
		$('#left_max,#left_min,#right_max,#right_min').on('keyup', function (e) {
			if (e.keyCode == 13) { // 'Enter' Key
				update() 
			}
			return true 
		}) 
	}) 
}
