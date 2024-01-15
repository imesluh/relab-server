//#region  setup start, home, download button
$('#bt_start1').prop('disabled', false)
$('#bt_home1').prop('disabled', false)
$('#bt_download1').prop('disabled', false)
//#endregion

var joints = true; // input field
var ready;
$(document).ready(function () {
	//#region setup input field
	$('input.joint').each(function (index, obj) {
		$(this).TouchSpin({
			min: $(this).attr('min'),
			max: $(this).attr('max'),
			step: $(this).attr('step'),
			decimals: 1,
			boostat: 5,
			maxboostedstep: 10,
			postfix: '°'
		});
	});

	$('input.endeffector').each(function (index, obj) {
		$(this).TouchSpin({
			min: $(this).attr('min'),
			max: $(this).attr('max'),
			step: $(this).attr('step'),
			decimals: 1,
			boostat: 5,
			maxboostedstep: 10,
			postfix: 'mm'
		});
	});

	$("div.endeffector").find('span.input-group-btn').hide();
	$("input.endeffector.form-control").attr('disabled', 'disabled');
	$("input.endeffector").val("");
	$("input.joint").val("");
	//#endregion

	var r2 = 40000;
	var open_modal = true;

	function showArbeitsraumError(open_modal){
		if (open_modal) {
			BootstrapDialog.show({
				message: 'Die gewünschte Zielposition liegt außerhalb des Arbeitsraumes.',
				closable: false,
				buttons: [{
					label: 'Ok',
					action: function (dialogRef) { dialogRef.close(); }
				}],
				onshow: function () { open_modal = false; },
				onhidden: function () { open_modal = true; }
			});
		};
	}

	//#region is input (X_E and Y_E) out of reagion 
	$('#Xe').change(function () {
		if ($(this).val() * $(this).val() + $('#Ye').val() * $('#Ye').val() > r2) {
			$(this).val(Math.sign($(this).val()) * Math.floor(Math.sqrt(r2 - $('#Ye').val() * $('#Ye').val()) * 10) / 10);
			showArbeitsraumError(open_modal);
		}
	})
	$('#Ye').change(function () {
		if ($(this).val() * $(this).val() + $('#Xe').val() * $('#Xe').val() > r2) {
			$(this).val(Math.sign($(this).val()) * Math.floor(Math.sqrt(r2 - $('#Xe').val() * $('#Xe').val()) * 10) / 10);
			showArbeitsraumError(open_modal);
		};
	})
	//#endregion

	//#region get positions from server
	$.ajax({
		type: 'GET',
		url: '/RobotikII/rest/be/CI/lab1/endeffector/',
		dataType: 'json'
	}).done(function (data) {
		var initBox = document.getElementById('initBox');
		$('#position1').html('\\(P_{1} = (' + data.Ziel[0][0] + ', ' + data.Ziel[0][1] + ', ' + data.Ziel[0][2] + ')^T\\si{\\milli\\metre}\\)');
		$('#position2').html('\\(P_{2} = (' + data.Ziel[1][0] + ', ' + data.Ziel[1][1] + ', ' + data.Ziel[1][2] + ')^T\\si{\\milli\\metre}\\)');
		$('#position3').html('\\(P_{3} = (' + data.Ziel[2][0] + ', ' + data.Ziel[2][1] + ', ' + data.Ziel[2][2] + ')^T\\si{\\milli\\metre}\\)');
		var i;
		var ready = 0;
		for (i = 0; i < data.done.length; i++) {
			if (data.done[i]) {
				ready++;
				$('#position' + (i + 1).toString()).css('color', 'green');
				$('#gly' + (i + 1).toString()).attr('class', 'glyphicon glyphicon-check');
				$('#gly' + (i + 1).toString()).css('color', 'green');
			};
		}
		if (ready == 3) {
			$("div.endeffector").find('span.input-group-btn').show();
			$("input.endeffector").removeAttr('disabled');
		} else {
			$(".d_axis li:nth-child(n+4)").each(function () { $(this).hide() });
		};
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, initBox])
	});
	//#endregion

	//#region setup behavior of inputs
	$('div.endeffector').find("input").keydown(function () {
		$("div.joint").find('span.input-group-btn').hide();
		$("input.joint").attr('disabled', 'disabled');
		$("input.endeffector").removeAttr('disabled');
		joints = false;
	});

	$('div.endeffector').find("input").on('paste', function () {
		$("div.endeffector").find('span.input-group-btn').show();
		$("div.joint").find('span.input-group-btn').hide();
		$("input.joint").attr('disabled', 'disabled');
		$("input.endeffector").removeAttr('disabled');
		joints = false;
	});

	$('button#bt_reset1').click(function () {
		$("div.joint").find('span.input-group-btn').show();
		$("div.endeffector").find('span.input-group-btn').show();
		$("input.joint").removeAttr('disabled');
		$("input.endeffector").removeAttr('disabled');
		$("input.endeffector").val("");
		$("input.joint").val("");
	});

	$('button#bt_home1').click(function () {
		$("input.joint").val("0.0");
		$("input.endeffector").val("");
		$("div.joint").find('span.input-group-btn').show();
		$("div.endeffector").find('span.input-group-btn').hide();
		$("input.joint.form-control").removeAttr('disabled');
		$("input.endeffector.form-control").attr('disabled', 'disabled');
		joints = true;
		setTimeout(() => { $('#bt_start1').click(); }, 500); // trigger start button after home button was clicked
	});
	//#endregion
});

//#region setup interaction behavior
$('#download1').click(function (event) {
	window.open("/RobotikII/rest/be/CI/lab1/download1/" + (new Date()).valueOf());
});

$('#bt_start1').click(function (e) {
	e.preventDefault();
	ready = false;
	
	var satisfied = true;
	if (joints) {
		$("input.endeffector").val("");
		var send_data = new Array($('input.joint').length + 1);
		$('input.joint').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				satisfied = false;
			}
			send_data[index] = parseFloat($(obj).val());
			$("input.endeffector").val("");
		});
		send_data[$('input.joint').length] = true;
	} else {
		$("input.joint").val("");
		var send_data = new Array($('input.endeffector').length + 1);
		$('input.endeffector').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				satisfied = false;
			}
			send_data[index] = parseFloat($(obj).val());
			$("input.joint").val("");
		});
		send_data[$('input.joint').length] = false;
	};
	if (satisfied == true) {
		$('#bt_start1').prop('disabled', true)
		$('#bt_home1').prop('disabled', true)
		$('#bt_download1').prop('disabled', true)
		$.ajax({
			url: '/RobotikII/rest/be/CI/lab1/start1/',
			data: JSON.stringify(send_data),
			type: 'POST',
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data.success) {
				if (data.joint) {
					$('span.endeffector').show();
					$("div#btn_endeffector").show();
					$('input.endeffector').each(function (index, obj) {
						$(obj).val(data.send_data[index]);
					});
					var i;
					var ready = 0;
					for (i = 0; i < data.done.length; i++) {
						if (data.done[i]) {
							ready++;
							$('#position' + (i + 1).toString()).css('color', 'green');
							$('#gly' + (i + 1).toString()).attr('class', 'glyphicon glyphicon-check');
							$('#gly' + (i + 1).toString()).css('color', 'green');
						};
					}
					if (ready == 3) {
						$(".d_axis li:nth-child(n+4)").each(function () { $(this).show() });
						$("div.endeffector").find('span.input-group-btn').show();
						$("input.endeffector").removeAttr('disabled');
						$('#gly_exer1').attr('class', 'glyphicon glyphicon-check');

					};
				} else {
					$('span.joint').show();
					$("div#btn_joint").show();
					$('input.joint').each(function (index, obj) {
						$(obj).val(data.send_data[index]);
					});
					$("div.joint").find('span.input-group-btn').show();
					$("input.joint").removeAttr('disabled');
				};
			} else {
				BootstrapDialog.alert(data.resp);
			};
		$('#bt_start1').prop('disabled', false)
		$('#bt_home1').prop('disabled', false)
		$('#bt_download1').prop('disabled', false)
		})
	} else {
		BootstrapDialog.alert("Bitte vervollständigen Sie Ihre Eingabe.");
	}
});
//#endregion
