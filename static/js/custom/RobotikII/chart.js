function change_graph(_callback) {
	var left = parseInt($("#left_button").val())
	var right = parseInt($("#right_button").val())
	

	$("#left_max").val(scales[left].domain()[1]);
	$("#left_min").val(scales[left].domain()[0]);
	$("#right_max").val(scales[right].domain()[1]);
	$("#right_min").val(scales[right].domain()[0]);
	Left_axis.call(d3.svg.axis().scale(scales[left]).orient('left').ticks(5));
	Right_axis.call(d3.svg.axis().scale(scales[right]).orient('right').ticks(5));
	_callback();
	}

function update() {
	var left_max=parseFloat(document.getElementById("left_max").value);
    	var left_min=parseFloat(document.getElementById("left_min").value);
	var right_max=parseFloat(document.getElementById("right_max").value);
	var right_min=parseFloat(document.getElementById("right_min").value);

	var left = parseInt($("#left_button").val())
	var right = parseInt($("#right_button").val())
	
	scales[left].domain([left_min,left_max]);
	Left_axis.call(d3.svg.axis().scale(scales[left]).orient('left').ticks(5));
	scales[right].domain([right_min,right_max]);
	Right_axis.call(d3.svg.axis().scale(scales[right]).orient('right').ticks(5));
	}

function tick() {
	now = new Date()
	var i =0
	data.forEach(function(da){
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
		.duration(duration-20)
		.ease('linear')
		.attr('transform', 'translate(' + x(now - (limit+1) * duration) + ')')
		.each('end', tick)

	// Remove oldest data points
	data.forEach(function(da){
		da.data.shift();
	})
}
	
var margin = {top: 30, right: 55, bottom: 30, left: 55}
var limit = 300 * 1,
    duration = 100,
    now = new Date(Date.now() - duration)
var 	body = document.body,
   		html = document.documentElement;
var width = Math.round($('#right_input').position().left - ($('#left_input').position().left+$('#left_input').width())),
	chartwidth= width - margin.left - margin.right,
	chartheight=1.0*(300 - margin.top - margin.bottom);
$('#realtimegraph').width(width)

var data = []
colors.forEach(function(col) {
		data.push({
            value: 0,
            color: col,
            data: d3.range(limit).map(function() {
            return 0
            })
        })
})


var x = d3.time.scale()
	.domain([now - (limit - 0)*duration, now - duration])
	.range([0, chartwidth])

var scales = []
ranges.forEach(function(ran) {
	scales.push(d3.scale.linear()
			.domain(ran)
			.range([chartheight, 0]))
})


var lines = []
scales.forEach(function(sca) {
	lines.push(d3.svg.line()
		    .interpolate('cardinal')
		    .x(function(d, i) {
		        return (x(now - (limit + 1 - i) * duration)+margin.left)
		    })
		    .y(function(d) {
		        return (sca(d)+ margin.top)
		    }))
})

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
  	.attr("transform", "translate(" + (chartwidth+3) + " ,0)")
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
		.attr('id','data'+String(index))
		.style('stroke', group.color)
		.style('opacity', 0)
	}

$('.dd_axis').each(function() {
	$('#data' + String($(this).val())).css("opacity", 1)
});

update()
tick()


$(document).ready(function(){
       $('#left_max,#left_min,#right_max,#right_min').on('keyup', function(e){
        if (e.keyCode===13){
		update();
	}
        return true;
        
    }); 
});
