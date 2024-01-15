var divVorgabe = $('div[x_vorgabe]')
var inputVorgabe = $('input[x_vorgabe]')
var inputVorfilter = $('input[vorfilter]')
var challenge = $('#challenge')

var leftButton = $("#left_button")
var rightButton = $("#right_button")
var groupClass = $(".group")
/*
	This function is a helper function, it helps to setup attributes for specific buttons,
	it handles the group class, left_button, right_button and the d_axis class.

	@param:
		opacity: How transparent should the div be
		leftBtnVal: Value of the left button
		leftBtnColor: Color of the left button
	 	linkIndex1: First link index
	 	linkIndex2: Second link index
	 	rightBtnVal: Value of the right button
	 	rightBtnColor: Color of the right button */
function setupInteractiveElements(opacity, leftBtnVal ='', leftBtnColor = '',
						 linkIndex1, linkIndex2, rightBtnVal, rightBtnColor = ''){
	let links = leftButton.next().children().toArray()
	groupClass.css('opacity', opacity)
	leftButton.val(leftBtnVal)
	leftButton.css('color', leftBtnColor)
	leftButton.html($(links[linkIndex1]).children().html() + ' <span class="caret" style="color:black "><span>')
	rightButton.val(rightBtnVal)
	rightButton.css('color', rightBtnColor)
	rightButton.html($(links[linkIndex2]).children().html() + ' <span class="caret" style="color:black "><span>')
	changeOpacity()
}

divVorgabe.slider('disable')
inputVorgabe.attr('disabled', true)
inputVorfilter.attr('disabled', false)
challenge.attr('disabled', true)

$.ajax({
	type: 'GET',
	url: mainroute + '/lab4/own/',
	data: new FormData(),
	contentType: false,
	processData: false,
	dataType: 'json'
}).done(function (data) {
	if (data['success'][0] === true) {
		$('#eigenVal').hide()
		$('.accept1, #polPanel').show()
		$('input[pol_s]').each(function (index, obj) {
			$(obj).val(-0.1)
		})
		$('div[pol_s]').each(function (index, obj) {
			$(obj).slider("value", -0.1)
		})
		if (data['success'][1] === true) {
			$('#challenge_div').show()
			challenge.attr('disabled', false)
		}
	}
})

var isChecked
var isHidden
var i

/*
	This is a helper function, it disables specific Start and download Buttons
	@param:
		disableStart1: boolean, disable start button
		disableStart2: boolean, disable start button
 */
function disableStartBtn(disableStart1=false, disableStart2=false){
	$('#bt_start1').prop('disabled', disableStart1)
	$('#bt_start2').prop('disabled', disableStart2)
}

$('#polPanel, .accept1').hide()
$('div[Führungsgrößen]').slider('disable')
$('input[Führungsgrößen]').attr('disabled', true)
$('#polPanel, .accept1, .bewertung, #challenge_div').hide()
disableStartBtn()

$(document).ready(function () {

	let btStart1 = $('#bt_start1')
	btStart1.click(function (event){
		event.preventDefault()
		if ($('#polPanel').is(':hidden')) {
			isHidden = "True"
			let inputPole = $('input[pole]')
			let sendData = new Array(inputPole.length + 1)
			let polSatisfied = true
			inputPole.each(function (index, obj) {
				if (isNaN(parseFloat($(obj).val())) || parseFloat($(obj).val()) >= 0) {
					polSatisfied = false
				}
				sendData[index] = parseFloat($(obj).val())
			})
			if (polSatisfied) {
				sendData[inputPole.length] = $('#check1').is(":checked")
				$('input[k_rueck]').each(function (index, obj) {
					sendData[index + inputPole.length + 1] = parseFloat($(obj).val())
				})
				$.ajax({
					url: mainroute + '/lab4/start1/',
					data: JSON.stringify(sendData),
					type: 'POST',
					contentType: "application/json",
					dataType: 'json'
				}).done(function (data) {
					disableStartBtn()
					if (data['success'] === true) {
						let popupwidth = $(window).width() * 0.45
						if (popupwidth < 100) { popupwidth = 100  }
						let popupheight = $(window).height() * 0.45
						if (popupheight < 100) { popupheight = 100  }
						let left = $(window).width() - popupwidth
						let top = $(window).height() - popupheight
						window.open("https://relab.imes.uni-hannover.de/static/html/expl4.html", "_blank", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=' + popupwidth + ', height=' + popupheight + ', top=' + top + ', left=' + left)
						$('#eigenVal').hide()
						$('.accept1, #polPanel').show()
						$('#messagebox').html('<p> K = [' + sendData[5] + ', ' + sendData[6] + ', ' + sendData[7] + ', ' + sendData[8] + ']</p>')
						$('input[pol_s]').each(function (index, obj) {
							$(obj).val(sendData[index])
						})
						$('div[pol_s]').each(function (index, obj) {
							$(obj).slider("value", sendData[index])
						})
					} else {
						BootstrapDialog.alert(data['resp'])
					}
				}).fail(function () {
					BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'))
					disableStartBtn()
				})
			} else {
				alert('Pole ungültig.')
			}
		} else {
			let polSatisfied = true
			isHidden = "False"
			let inputPole = $('input[pol_s]')
			let sendData = new Array(inputPole.length)
			inputPole.each(function (index, obj) {
				if (isNaN(parseFloat($(obj).val())) || parseFloat($(obj).val()) >= 0) {
					polSatisfied = false
				}
				sendData[index] = parseFloat($(obj).val())
			})
			if (polSatisfied) {
				sendData[inputPole.length] = $('#check1').is(":checked")
				$.ajax({
					url: mainroute + '/lab4/start1/',
					data: JSON.stringify(sendData),
					type: 'POST',
					contentType: "application/json",
					dataType: 'json'
				}).done(function (data) {
					disableStartBtn()
					if (data['success'] === true) {
						$('input[pol_s]').each(function (index, obj) {
							$(obj).val(sendData[index])
						})
						$('div[pol_s]').each(function (index, obj) {
							$(obj).slider("value", sendData[index])
						})
					} else {
						BootstrapDialog.alert(data['resp'])
					}
				}).fail(function () {
					BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'))
					disableStartBtn()
				})
			} else {
				alert('Pole ungültig.')
			}
		}
	})

	let btReset = $('#bt_reset')
	btReset.click(function (event){
		event.preventDefault()
		$.ajax({
			type: 'GET',
			url: mainroute + '/lab4/reset/',
			data: new FormData(),
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
			}
			else {
				BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.'))
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.'))
		})
	})

	let btStop = $('#bt_stop')
	btStop.click(function (event){
		event.preventDefault()
		$.ajax({
			type: 'GET',
			url: mainroute + '/lab4/stop/',
			data: new FormData(),
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function (data, textStatus, jqXHR) {
		}).fail(function () {
			BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.'))
		})
	})

	let btAccept1 = $('#bt_accept1')
	btAccept1.click(function (event){
		event.preventDefault()
		if (btAccept1.text() === "Accept") {
			i = 0
			$.ajax({
				type: 'GET',
				url: mainroute + '/lab4/accept/',
				data: new FormData(),
				contentType: false,
				processData: false,
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					$('#gly_exer1').attr('class', 'glyphicon glyphicon-check')
					$('#part_pol').collapse('hide')
					btAccept1.text('Change')
					setupInteractiveElements(0, 0, 'blue',0,2,2,'gray')
					$('#collapseTwo').collapse('show')
					btAccept1.text('Change')
					$('#bt_accept2').prop("disabled", false)
				}
				else {
					BootstrapDialog.alert(unescape('Die obere Gleichgewichtslage ist nicht stabil.'))
				}
			}).fail(function () {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			})
		}
		else {
			$('div[pole]').slider('enable')
			$('input[pole]').attr('disabled', false)
			$('#bt_accept1').text("Accept")
			setupInteractiveElements(0,1,'green',1,2,2,'blue')
			$('#collapseTwo').collapse('hide')
			$('#part_pol').collapse('show')
			$('#bt_accept').text('Accept')
			divVorgabe.slider('disable')

			inputVorgabe.attr('disabled', true)
			inputVorfilter.attr('disabled', false)
			$('#bt_accept2').text("Accept")
			inputVorfilter.val(0)
			inputVorgabe.val(0)
			divVorgabe.slider("value", 0)
		}
	})

	let btAccept2 = $('#bt_accept2')
	btAccept2.click(function (event){
		event.preventDefault()
		let sendData = new Array(inputVorfilter.length + 1)
		inputVorfilter.each(function (index, obj) {
			sendData[index] = parseFloat($(obj).val())
		})
		sendData[inputVorfilter.length] = $('#check1').is(":checked")
		$.ajax({
			url: mainroute + '/lab4/accept2/',
			data: JSON.stringify(sendData),
			type: 'POST',
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			disableStartBtn()
			if (data['success'] == true) {
				$('#gly_exer2').attr('class', 'glyphicon glyphicon-check')
				divVorgabe.slider('enable')
				inputVorgabe.attr('disabled', false)
				inputVorfilter.attr('disabled', true)
				$('#bt_accept2').prop("disabled", true)
				challenge.attr('disabled', false)
				$('#challenge_div').show()
			} else {
				BootstrapDialog.alert(data['resp'])
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'))
			disableStartBtn()
		})
	})

	let btChallenge = $('#bt_challenge')
	btChallenge.click(function (event){
		event.preventDefault()
		$('div[pole]').slider('enable')
		$('input[pole]').attr('disabled', false)
		$('#bt_accept1').text("Accept")
		$('#collapseTwo').collapse('hide')
		divVorgabe.slider('disable')
		inputVorgabe.attr('disabled', true)
		inputVorfilter.attr('disabled', false)
		$('#bt_accept2').text("Accept")
		inputVorfilter.val(0)
		inputVorgabe.val(0)
		divVorgabe.slider("value", 0)
		$('.bewertung, #polPanel').show()
		$('.accept1').hide()
		$('#part_pol').collapse('show')
	})

	let btBack = $('#bt_back')
	btBack.click(function (event){
		event.preventDefault()
		$('#part_pol').collapse('hide')
		$('.bewertung').hide()
		$('#bt_accept').text('Change')

		setupInteractiveElements(0, 0,'blue', 0, 2, 2, 'gray')
		$('#collapseTwo').collapse('show')
		$('#bt_accept1').text('Change')
		$('#bt_accept2').prop("disabled", false)
		$('.accept1').show()
	})

	let btBewerten = $('#bt_bewerten')
	btBewerten.click(function (event){
		event.preventDefault()
		$('#messagebox2').html('')
		$.ajax({
			type: 'GET',
			url: mainroute + '/lab4/challenge/',
			data: new FormData(),
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				let feedback = ''
				feedback = feedback + '\\(\\Delta_\\mathrm{x} = '
				feedback = feedback + data['dx'] + ' \\si{\\milli\\metre}, \\) '
				feedback = feedback + '\\(\\Delta_\\mathrm{\\varphi} = '
				feedback = feedback + data['dp'] + '\\si{\\milli\\radian}, \\) <b> \\(Score = '
				feedback = feedback + data['score'] + '\\)</b>'
				$('#messagebox2').html('<p>' + feedback + '</p>')
				MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'messagebox2'])
			}
		})
	})

})
