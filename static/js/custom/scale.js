// This script is used to scale the graph data to a specific range
function update() {
	var leftMax = parseFloat(document.getElementById("left_max").value);
	var leftMin = parseFloat(document.getElementById("left_min").value);
	var rightMax = parseFloat(document.getElementById("right_max").value);
	var rightMin = parseFloat(document.getElementById("right_min").value);
	var left = parseInt($("#left_button").val())
	var right = parseInt($("#right_button").val())

	scales[left].domain([leftMin, leftMax]);
	Left_axis.call(d3.svg.axis().scales[left].orient('left').ticks(5));
	scales[right].domain([rightMin, rightMax]);
	Right_axis.call(d3.svg.axis().scales[right].orient('left').ticks(5));
}


$(document).ready(function () {
	$('#left_max,#left_min,#right_max,#right_min').on('keyup', function (e) {
		if (e.keyCode == 13) { // enter key pushed
			update();
		}
		return true;

	});
});