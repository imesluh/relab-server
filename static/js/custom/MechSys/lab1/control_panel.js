// This function will enable or disable, start/download buttons
function disableStartDownloadBtn(disableStartButton1=true, disableStartButton2=true, disableDownloadButton=true){
	$('#bt_start1').prop('disabled', disableStartButton1)
	$('#bt_start2').prop('disabled', disableStartButton2)
	$('.download').prop('disabled', disableDownloadButton)
}

/*
	This is a helper function, it will displays feedback to the user
	@param:
		id: is used to address the right object */
function displayFeedback(id, data){
	let hasErrorOccurred = data['error'][0] == false && data['error'][1] == false
	if (hasErrorOccurred) { $('#'+id).attr('class', 'glyphicon glyphicon-check')  }

	let feedback = ""

	hasErrorOccurred = data['error'][0] == true
	if (hasErrorOccurred) { feedback += "<span style='color:red'>\\(T_\\mathrm{s} = " }
	else { feedback += "<span style='color:green'>\\(T_\\mathrm{s} = " }

	feedback += data['Tm'] + ' \\si{\\milli\\second},\\) &nbsp</span>'

	hasErrorOccurred = data['error'][1] == true
	if (hasErrorOccurred) { feedback += "<span style='color:red'>\\(v_\\mathrm{m} = " }
	else { feedback += "<span style='color:green'>\\(v_\\mathrm{m} = " }

	if(id=='gly_exer1') {
		feedback += data['vm'] + '\\% \\) </span>'
	}else{
		feedback += data['vm'] + '\\%, \\)</span> &nbsp <b> \\(Score = '
		feedback += data['score'] + ' \\)</b>'
	}

	$('#messagebox').html('<p>' + feedback + '</p>')
	MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'messagebox'])
	if (data['error'][2]) {BootstrapDialog.alert(unescape('Die Verbindung war kurzzeitig unterbrochen. Versuchen Sie es bitte erneut.'))}
}

/* This is a helper function, it will setup all the buttons */
function setupInteractiveElements(btn_accept='', opacity, leftButtonValue, leftButtonColor='',
				 indexLink1, indexLink2, rightButtonValue, rightButtonColor = '',
				 disableSpeedInput, disableSpeedSlide, disablePosInput, disablePositionSlider, collapseTwo){
	let leftButton = $("#left_button")
	let links = leftButton.next().children().toArray()
	let rightButton = $("#right_button")
	$('#bt_accept').text(btn_accept)
	$('.group').css('opacity', opacity)
	leftButton.val(leftButtonValue)
	leftButton.css('color', leftButtonColor)
	leftButton.html($(links[indexLink1]).children().html() + ' <span class="caret" style="color:black"><span>')
	rightButton.val(rightButtonValue)
	rightButton.css('color', rightButtonColor)
	rightButton.html($(links[indexLink2]).children().html() + ' <span class="caret" style="color:black"><span>')
	changeOpacity()
	$('input[geschwindigkeit]').attr('disabled', disableSpeedInput)
	$('div[geschwindigkeit]').slider(disableSpeedSlide)
	$('input[position]').attr('disabled', disablePosInput)
	$('div[position]').slider(disablePositionSlider)
	$('#collapseTwo').collapse(collapseTwo)
}

//disableStartDownloadBtn()

$(document).ready(function () {
	// Reset the whole experiment
	$('#bt_reset1').click(function (event) {
		event.preventDefault()
		disableStartDownloadBtn()
		$.ajax({
			type: 'GET',
			url: mainroute + '/lab1/reset/',
			data: new FormData(),
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function (data) {
			var wasSuccessful = data['success'] == true
			if (!wasSuccessful) {
				BootstrapDialog.alert(data['resp'])
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.'))
			disableStartDownloadBtn(true,true,false)
		})
	})
	// If being pressed test the input parameters
	$('#bt_start1').click(function (event) {
		event.preventDefault()
		disableStartDownloadBtn()

		$('#messagebox').html('')
		var data = new Array($('input[ges]').length)
		$('input[geschwindigkeit]').each(function (index, obj) {
			data[parseInt($(obj).attr("id"))] = parseFloat($(obj).val())
		})
		$.ajax({
			url: mainroute + '/lab1/test1/',
			data: JSON.stringify({ 'Regler': data }),
			type: 'POST',
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			disableStartDownloadBtn(false, false, false)
			var wasSuccessful = data['success'] == true
			if (wasSuccessful) {
				displayFeedback('gly_exer1', data)
			} else {
				BootstrapDialog.alert(data['resp'])
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'))
			disableStartDownloadBtn(false, false, false)
			
		})
	})
	// If being pressed download the experiment 
	$('#bt_download1').click(function (event) {
		event.preventDefault()
		window.open(mainroute + "/lab1/download/" + (new Date()).valueOf())
	})
	// If being pressed overtake the input parameters and move over to the next task
	$('#bt_accept').click(function (event) {
		event.preventDefault()
		$('#messagebox').html('')

		if ( $('#bt_accept').text() == "Accept" ) {
			var data = new Array($('input[ges]').length)
			$('input[geschwindigkeit]').each(function (index, obj) {
				data[parseInt($(obj).attr("id"))] = parseFloat($(obj).val())
			})
			$.ajax({
				url: mainroute + '/lab1/accept/',
				data: JSON.stringify(data),
				type: 'POST',
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				var wasSuccessful = data['success'] == true
				if (wasSuccessful) {
					$('#part_vel').collapse('hide')
					setupInteractiveElements('Change', 0, 0, 'blue', 0, 2, 2, 'gray', true, 'disable', false, 'enable', 'show')
				} else {
					BootstrapDialog.alert(data['resp'])
					$('#part_vel').collapse('show')
				}
			}).fail(function () {
				BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'))
			})
		}
		else {
			setupInteractiveElements( 'Accept', 0, 1, 'green', 1, 3, 3, 'orange', false, 'enable', true, 'disable', 'hide' )
			$('#part_vel').collapse('show')
		}
	})
	// If being pressed test the input parameters
	$('#bt_start2').click(function (event) {
		event.preventDefault()
		disableStartDownloadBtn()
		var data = new Array($('input[pos]').length)

		$('input[position]').each(function (index, obj) {
			data[parseInt($(obj).attr("id"))] = parseFloat($(obj).val())
		})
		$.ajax({
			url: mainroute + '/lab1/test2/',
			data: JSON.stringify({ 'Regler': data, 'jump': $('#test_pos').val() }),
			type: 'POST',
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			disableStartDownloadBtn(false, false, false)
			var wasSuccessful = data['success'] == true
			if (wasSuccessful) {
				displayFeedback('gly_exer2', data)
			} else {
				BootstrapDialog.alert(data['resp'])
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'))
			disableStartDownloadBtn(false, false, false)
		})
	})
	$('#bt_download2').click(function (event) {
		event.preventDefault()
		window.open(mainroute + "/lab1/download/" + (new Date()).valueOf())
	})
})




