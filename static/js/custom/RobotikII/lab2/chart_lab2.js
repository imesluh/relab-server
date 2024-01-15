// Used in control2.html
var btn_clicked = false;

$('#bt_start1').click(function (e) {
	btn_clicked = true;
});

var achses = 3;
// Werte des graphen aktualisieren
function change_graph(_callback) {
	var left = parseInt($("#left_button").val())
	var left_ax = parseInt($("#left_achse_button").val())
	var right = parseInt($("#right_button").val())
	var right_ax = parseInt($("#right_achse_button").val())

	// maximale und minimale graph höhe festlegen
	// domain() default liegt zwischen 0 und 1
	$("#left_max").val(scales[left_ax * 6 + left].domain()[1]);
	$("#left_min").val(scales[left_ax * 6 + left].domain()[0]);
	$("#right_max").val(scales[right_ax * 6 + right].domain()[1]);
	$("#right_min").val(scales[right_ax * 6 + right].domain()[0]);

	// Graphen Axen einstellen
	Left_axis.call(d3.svg.axis().scale(scales[left_ax * 6 + left]).orient('left').ticks(5));
	Right_axis.call(d3.svg.axis().scale(scales[right_ax * 6 + right]).orient('right').ticks(5));
	_callback();
}

// Aktualisiere Graphen mit den neuen Werten für max,min left und right
// Left und right (max, min) sind veränderbar und können per Hand eingetragen werden
function update() {
	var left_max = parseFloat(document.getElementById("left_max").value);
	var left_min = parseFloat(document.getElementById("left_min").value);
	var right_max = parseFloat(document.getElementById("right_max").value);
	var right_min = parseFloat(document.getElementById("right_min").value);

	var left = parseInt($("#left_button").val())
	var left_ax = parseInt($("#left_achse_button").val())
	var right = parseInt($("#right_button").val())
	var right_ax = parseInt($("#right_achse_button").val())

	scales[left_ax * 6 + left].domain([left_min, left_max]);
	Left_axis.call(d3.svg.axis().scale(scales[left_ax * 6 + left]).orient('left').ticks(5));
	scales[right_ax * 6 + right].domain([right_min, right_max]);
	Right_axis.call(d3.svg.axis().scale(scales[right_ax * 6 + right]).orient('right').ticks(5));
}

// This function handles the shifting of the x-axis
function tick() {
	now = new Date()
	var i = 0
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
		.duration(duration - 20)
		.ease('linear')
		.attr('transform', 'translate(' + x(now - (limit + 1) * duration) + ')')
		.each('end', tick)

	// Remove oldest data points
	data.forEach(function (da) {
		da.data.shift();
	})
}

var margin = { top: 30, right: 55, bottom: 30, left: 55 }
var limit = 300 * 1, // limits the x_axis and y_axis to a specific area and specific values
	duration = 100,
	now = new Date(Date.now() - duration)
var body = document.body,
	html = document.documentElement;
var width = Math.round($('#right_input').position().left - ($('#left_input').position().left + $('#left_input').width())),
	chartwidth = width - margin.left - margin.right,
	chartheight = 1.0 * (300 - margin.top - margin.bottom);
$('#realtimegraph').width(width)

var data = []

// The colors variable is defined outside of charts.js in control .html
// colors display the color of the Units of the chart 
colours = colors.concat(colors).concat(colors);
colours.forEach(function (col, ind) {
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
	.domain([now - (limit - 0) * duration, now - duration])
	.range([0, chartwidth])

// Dertermine how to scale the values within the given range
var scales = []
rangs = ranges.concat(ranges).concat(ranges);
rangs.forEach(function (ran) {
	scales.push(d3.scale.linear()
		.domain(ran)
		.range([chartheight, 0]))
})


var lines = []
// Determine how the graph line should look like
scales.forEach(function (sca) {
	lines.push(d3.svg.line()
		.interpolate('basis')
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
	.attr('transform', "translate(" + (margin.left) + "," + margin.top + ")");

var axis = rtg.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0,' + chartheight + ')')
	.call(x.axis = d3.svg.axis().scale(x).orient('bottom'));

var Right_axis = rtg.append('g')
	.attr('class', 'y axis')
	.attr("transform", "translate(" + (chartwidth + 3) + " ,0)")
	.call(d3.svg.axis().scale(scales[4]).orient('right').ticks(5));
var Left_axis = rtg.append('g')
	.attr('class', 'y axis')
	.attr("transform", "translate(-3,0)")
	.call(d3.svg.axis().scale(scales[1]).orient('left').ticks(5));



var paths = svg.append('g')
for (var index in data) {
	var group = data[index]
	group.path = paths.append('path')
		.data([group.data])
		.attr('class', 'group')
		.attr('id', 'data' + String(index))
		.style('stroke', group.color)
		.style('opacity', 1)
}

$('.dd_axis').each(function () {
	$('#data' + String($(this).val())).css("opacity", 1)
});

update()
tick()
$('.group').css('opacity', 0)
change_opacity();

// If Enter-Key is released call update function
$(document).ready(function () {
	$('#left_max,#left_min,#right_max,#right_min').on('keyup', function (e) {
		if (e.keyCode === 13) { // 'Enter' Key
			update();
		}
		return true;

	});
});
