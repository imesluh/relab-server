// get new position from server
$.ajax({
	type: 'GET',
	url: '/RobotikII/rest/be/CI/lab4/newPosition/',
	data: false,
	contentType: false,
	processData: false
}).done(function (data, textStatus, jqXHR) {
}).fail(function (data) {
	BootstrapDialog.alert(unescape('Die Verbindung zum Server ist fehlgeschlagen'));
});

$('#download').click(function (event) {
	window.open("/RobotikII/rest/be/CI/lab4/download/" + (new Date()).valueOf());
});

// Wenn etwas hochgeladen wurde, nachdem der Upload Button gedrückt wurde
$('#uploadFile').change(function (e) {
	var formData = new FormData();
	if ($(this).prop('files').length > 0) {
		file = $(this).prop('files')[0];
		formData.append('file', file); // since this is your file input
	}

	// Füge das Bild an die Position des Streams
	function setupImage(data){
		var img = document.createElement("img");
		img.src = "data:image/png;base64," + data['image'];
		img.id = 'overlay';
		var src = document.getElementById("stream");
		img.width = $('#remotevideo').width();
		img.style.cssText = "position:absolute;top:0px;left:" + $('#stream').css('padding-left') + ";";
		src.appendChild(img);
	}

	console.log("--- uploadFile()")
	// Bild/Datei an den Server schicken
	$.ajax({
		url: '/RobotikII/rest/be/CI/lab4/upload/',
		data: formData,
		type: 'POST',
		contentType: false,
		processData: false
	}).done(function (data) {
		if (data.success) {
			BootstrapDialog.alert(data['resp']);
			console.log("### uploadFile - success");
			setupImage(data)
			// Clear Button Anzeigen, welcher das Bild "entfernt"
			$('#clear').show();

		} else {
			BootstrapDialog.alert(data['resp']);
			if (data['image'] != '') {
				console.log("### uploadFile - failure");
				setupImage(data)
				$('#clear').show();
			}
		}
	}).fail(function (data) {
		BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'));
	});
	$('#uploadFile').val(null);
});

// Bild entfernen und neue Position anfragen
$('#clear').click(function (event) {
	try {
		document.getElementById("overlay").remove();
	} finally {
		$.ajax({
			type: 'GET',
			url: '/RobotikII/rest/be/CI/lab4/newPosition/',
			data: false,
			contentType: false,
			processData: false
		}).done(function (data, textStatus, jqXHR) {
			$('#clear').hide();
		}).fail(function (data) {
			BootstrapDialog.alert(unescape('Die Verbindung zum Server ist fehlgeschlagen'));
		});
	}
});
