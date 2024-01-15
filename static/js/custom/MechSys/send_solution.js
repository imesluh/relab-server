// This script is used to send the entered solution
$(function () {
	$('#send').click(function () {
		var input = {}
		var completeInput = true
		$.each($('input'), function (_index, obj) {
			input[obj.id] = obj.value
		})
		$("input[required]").each(function (_index, obj) {
			if (obj.value == "" && completeInput == true) {
				BootstrapDialog.alert("Ihre Eingaben sind unvollständig.")
				completeInput = false
			}
		})
		if (completeInput) {
			$.ajax({
				type: 'POST',
				url: mainroute + '/solution3/',
				data: JSON.stringify(input),
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					BootstrapDialog.alert(data['resp'])
				}
				else {
					BootstrapDialog.alert(data['resp'])
				}
				console.log(input);
				console.log(JSON.stringify(input));
			}).fail(function () {
				BootstrapDialog.alert(unescape('Die Lösung konnte nicht an den Server gesendet werden.'))
			})
		}
	})
})

$(function () {
	$('#send_eval').click(function () {
		var return_data = {};
		var completeInput = true;
		var str_label = '';
		/*$("input[required]").each(function (_index, obj) {
		}*/
		var radio_inputs = $("input[type='radio']");
		for (i=0; i<radio_inputs.length; i++) {
			if (radio_inputs[i].checked) {
				let tmp_id = radio_inputs[i].id.split('_');
				str_label = tmp_id[0];
				return_data[str_label] = parseInt(tmp_id[tmp_id.length-1]);
			}
		}
		var text_inputs = [];
		text_inputs = $("input[type='text']");
		for (i=0; i<text_inputs.length; i++) {
			str_label = text_inputs[i].id;
			return_data[str_label] = text_inputs[i].value;
		}

		/*$.each($('input'), function (_index, obj) {
			if (obj.type == "radio") {
				return_data[obj.id] = obj.checked;
			} else {
				return_data[obj.id] = obj.value;	// Freitextantwort
			}

			//----------------
			if (obj.type == "radio") {
				input[obj.id] = obj.checked;
			} else {
				input[obj.id] = obj.value; 	// Freitextantwort
			}
		})*/
		/*$("input[required]").each(function (_index, obj) {
			if ((obj.value == "" ) && completeInput == true) {
				BootstrapDialog.alert("Ihre Eingaben sind unvollständig.")
				completeInput = false
			}
		})*/
		console.log(return_data);
		console.log(JSON.stringify(return_data));
		if (completeInput) {
			$.ajax({
				type: 'POST',
				url: mainroute + '/evaluation/',
				data: JSON.stringify(return_data),
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					BootstrapDialog.alert(data['resp'])
				}
				else {
					BootstrapDialog.alert(data['resp'])
				}
			}).fail(function () {
				BootstrapDialog.alert(unescape('Die Lösung konnte nicht an den Server gesendet werden.'))
			})
		}
	})
})
