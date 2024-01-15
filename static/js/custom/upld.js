$(function () {
	$(document).on('change', ':file', function () {
		var table = this.files[0];
		var tabletype = table.type;
		var match = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
		if (table.size > 1 * 1024 * 1024) {
			$("#file_select").css("color", "red");
			BootstrapDialog.alert(unescape("Die Datei ist zu gro%DF. Die maximal zul%E4ssige Dateigr%F6%DFe betr%E4gt 1 MB."));
		}
		else if (!((tabletype == match[0]) || (tabletype == match[1]) || (tabletype == match[2]))) {
			$("#file_select").css("color", "red");
			BootstrapDialog.alert(unescape("Bitte w%E4hlen Sie eine .csv-Datei aus."));
		}
		else {
			$("#file_select").css("color", "green");
		}
		var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});


	$(document).ready(function () {
		$(':file').on('fileselect', function (event, numFiles, label) {
			var input = $(this).parents('.input-group').find(':text'),
				log = numFiles > 1 ? numFiles + ' files selected' : label;

			if (input.length) {
				input.val(log);
			} else {
				if (log) alert(log);
			}

		});
	});
});