
$(function () {
	$('#send').click(function () {
		var input = {};
		var remind = 0; // Gibt an, ob ein Fehler aufgetreten ist
		// lies eingabe aus 
		$.each($('input'), function (index, obj) {
			input[obj.id] = obj.value;
		});

		// check if all required inputs are given
		$("input[required]").each(function (index, obj) {
			if (obj.value == "" && remind == 0) {
				BootstrapDialog.alert("Ihre Eingaben sind unvollständig.");
				remind = 1
			}
		})
		if (remind != 1) {
			// verschicke die eingabe an den server
			$.ajax({ 
				type: 'POST',
				url: '/RobotikII/rest/be/SI/solution3/',
				data: JSON.stringify(input),
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data, textStatus, jqXHR) {
				if (data['success'] == true) { // eingaben sind richtig
					// Gib die Antwort vom Server aus
					BootstrapDialog.show({
						message: data['resp'],
						closable: false,
						buttons: [{
							label: 'OK',
							cssClass: 'btn-default',
							action: function (dialogRef) { dialogRef.close(); }
						}],
						onshown: function () {
							var popup = document.getElementsByClassName('bootstrap-dialog');
							MathJax.Hub.Queue(['Typeset', MathJax.Hub, popup]);
						}
					});
				}
				else { // Eingabe war Fehlerhaft
					// Gib einen Fehler aus
					BootstrapDialog.show({
						message: data['resp'],
						closable: false,
						buttons: [{
							label: 'OK',
							cssClass: 'btn-default',
							action: function (dialogRef) { dialogRef.close(); }
						}],
						onshown: function () {
							var popup = document.getElementsByClassName('bootstrap-dialog');
							MathJax.Hub.Queue(['Typeset', MathJax.Hub, popup]);
						}
					});
				}
			}).fail(function (data) {
				BootstrapDialog.alert(unescape('Die Lösung konnte nicht an den Server gesendet werden.'));
			});
		}
	});
});
