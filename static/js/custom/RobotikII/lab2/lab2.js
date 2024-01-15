$.ajax({
	type: 'GET',
	url: '/RobotikII/rest/be/CI/lab2/init/',
	data: new FormData(),
	contentType: false,
	processData: false,
	dataType: 'json'
}).done(function (data, textStatus, jqXHR) {
	if (data['Mess']) {
		if (data['Ident']) {
			$(".d_axis li:nth-child(n+6)").each(function () { $(this).show() });
			$('#validation').show();
			$('#gly_exer1').attr('class', 'glyphicon glyphicon-check');
		} else {
			$(".d_axis li:nth-child(n+6)").each(function () { $(this).hide() });
			$('#validation').hide();
			$('#solution').show();
		}
	} else {
		$(".d_axis li:nth-child(n+6)").each(function () { $(this).hide() });
		$('#solution').hide();
		$('#validation').hide();
	}
}).fail(function () {
	BootstrapDialog.alert(unescape('Die Verbindung zum Server ist fehlgeschlagen'));
});



$(document).ready(function () {

	function deactivateStart(start1, start2){
		$('#start1').prop('disabled', start1)
		$('#start2').prop('disabled', start2)

	}
	function deactivateDownload(download1, download2){
		$('#download1').prop('disabled', download1)
		$('#download2').prop('disabled', download2)
	}
	
	//#region click behavior
	$('#download1').click(function () {
		window.open("/RobotikII/rest/be/CI/lab2/download1/" + (new Date()).valueOf());
	});
	$('#download2').click(function () {
		window.open("/RobotikII/rest/be/CI/lab2/download1/" + (new Date()).valueOf());
	});

	$('#home').click(function (event) {
		event.preventDefault();
		deactivateStart(true, true)
		deactivateDownload(true, true)
		$('#home').prop('disabled', true)
		$.ajax({
			type: 'GET',
			url: '/RobotikII/rest/be/CI/lab2/home/',
			data: new FormData(),
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function () {
			$('#home').prop('disabled', false)
			deactivateStart(false, false)
			deactivateDownload(false, false)
		}).fail(function (data) {
			BootstrapDialog.alert(unescape('Die Home-Position konnte nicht angefahren werden.'));
			$('#home').prop('disabled', false)
			deactivateStart(false, false)
			deactivateDownload(false, false)
		});
	});
	$('#start1').click(function (event) {
		event.preventDefault();
		$('#home').prop('disabled', true)
		deactivateStart(true, true)
		deactivateDownload(true, true)
		$.ajax({
			type: 'POST',
			url: '/RobotikII/rest/be/CI/lab2/start1/',
			data: JSON.stringify(parseInt($("#dd-button").val())),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				if (data['alldone'] == true) { $('#solution').show(); }
				BootstrapDialog.alert(data['resp'])
				$('#home').prop('disabled', false)
				deactivateStart(false, false)
				deactivateDownload(false, false)
			}
			else {
				BootstrapDialog.alert(data['resp']);
				$('#home').prop('disabled', false)
				deactivateStart(false, false)
				deactivateDownload(false, false)
			}
		}).fail(function (data) {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'));
			$('#home').prop('disabled', false)
			deactivateStart(false, false)
			deactivateDownload(false, false)
		});
	});
	$('#send').click(function (e) {
		e.preventDefault();
		var config_satisfied = true;
		var send_data = {};
		$('input.config').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				config_satisfied = false;
			}
			send_data[obj.id] = parseFloat($(obj).val());
		});
		if (config_satisfied == true) {
			$.ajax({
				url: '/RobotikII/rest/be/CI/lab2/send1/',
				data: JSON.stringify(send_data),
				type: 'POST',
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data.success) {
					BootstrapDialog.alert(data['resp']);
					$(".d_axis li:nth-child(n+6)").each(function () { $(this).show() });
					$('#gly_exer1').attr('class', 'glyphicon glyphicon-check');
					$('#validation').show();
					$('#solution').hide();
				} else {
					BootstrapDialog.alert(data['resp']);
					$('#solution').hide();
				}
				;
			}).fail(function (data) {
				BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'));
			});
		} else { BootstrapDialog.alert(unescape("Bitte vervollständigen Sie Ihre Eingabe.")); }

	});

	$('#start2').click(function (event) {
		event.preventDefault();
		$('#home').prop('disabled', true)
		deactivateStart(true, true)
		deactivateDownload(true, true)
		var form_data = new FormData();
		$.ajax({
			type: 'GET',
			url: '/RobotikII/rest/be/CI/lab2/start2/',
			data: false,
			contentType: false,
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				$('#download2').prop('disabled', false);
				$('#gly_exer2').attr('class', 'glyphicon glyphicon-check');
				BootstrapDialog.alert(data['resp']);
			}
			else {
				BootstrapDialog.alert(data['resp']);
				$('#home').prop('disabled', false)
				deactivateStart(false, false)
				deactivateDownload(false, false)
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'));
			$('#home').prop('disabled', false)
			deactivateStart(false, false)
			deactivateDownload(false, false)
		});
	});
	//#endregion


});
