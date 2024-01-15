function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

$(".choose_dd li a").click(function () {
	var dd_button = $(this).parent().parent().prev()
	if (!dd_button.is('button')) {
		if (dd_button.prev().is('button')) {
			dd_button = dd_button.prev();
		} else { alert('Wenden Sie sich bitte an den Systemadministrator'); }
	}
	dd_button.html('<font>' + $(this).html() + '</font><span class="caret" style="color:black;"></span>');
	var index = $(this).parent().index();
	dd_button.attr('value', index);

	if (dd_button.attr('id') == "stream_select" || dd_button.attr('id') == "camera_select") {
		if ($('#camera_select').attr('value') == 0) {
			var id = parseInt($('#stream_select').attr('value')) + 3;
		} else {
			var id = parseInt($('#stream_select').attr('value')) + 5;
		}
		//var body = { "request": "stop"};
		//streaming.send({"message": body});
		//streaming.hangup();
		var body = { request: "switch", id: id };
		streaming.send({ "message": body });
		setTimeout(function () {
			var body = { request: "watch", id: id };
			streaming.send({ "message": body });
		}, 500);
	}
});
