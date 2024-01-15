var allowed = false;
$('#camera_select').disabled = true
//#region init
// lab3 wurde gestartet
$.ajax({
	type: 'GET',
	url: '/RobotikII/rest/be/CI/lab3/init/',
	data: new FormData(),
	contentType: false,
	processData: false,
	dataType: 'json'
}).done(function (data, textStatus, jqXHR) {
	if (data['Cross']) {
		$('#gly_exer1').attr('class', 'glyphicon glyphicon-check');
		allowed = true;
		$('#collapseOne').hide();
	} else {
		allowed = false;
		$('#collapseOne').show();
	}
}).fail(function (data) {
	BootstrapDialog.alert(unescape('Die Verbindung zum Server ist fehlgeschlagen'));
});
//#endregion

$('#download1').click(function () {
	window.open("/RobotikII/rest/be/CI/lab3/download1/" + (new Date()).valueOf());
});

$('#start1').click(function (e) {
	e.preventDefault();
	var config_satisfied = true;
	var send_data = {};
	// check if inputs are numbers
	$('input.config').each(function (index, obj) {
		if (isNaN(parseFloat($(obj).val()))) {
			config_satisfied = false;
		}
		send_data[obj.id] = parseFloat($(obj).val());
	});

	if (config_satisfied == true) {
		$.ajax({
			url: '/RobotikII/rest/be/CI/lab3/start1/',
			data: JSON.stringify(send_data),
			type: 'POST',
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data.success) { // exercise done successfully
				BootstrapDialog.alert(data['resp']);
				// mark exercise1 as done
				$('#gly_exer1').attr('class', 'glyphicon glyphicon-check');
				allowed = true;
				$("#cross1").css('display', 'block');
				$('#collapseOne').hide();
			} else {
				BootstrapDialog.alert(data['resp']);
				allowed = false;
				$("#cross1").css('display', 'none');
				$('#collapseOne').show();
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'));
		});
	} else { BootstrapDialog.alert(unescape("Bitte vervollständigen Sie Ihre Eingabe.")); }

});
