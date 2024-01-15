// This script sets a specific size for the site where the content 
// can be displayed in
$(document).ready(function () {
	$('#website').css({ minWidth: $(window).width() });
	$(window).resize(function () {
		$('#website').css({ minWidth: $(window).width() });
	});
});