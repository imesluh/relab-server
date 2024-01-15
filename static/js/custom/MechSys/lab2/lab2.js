
/*
	This function is a helper function, it helps to setup attributes for specific buttons,
	it handles the group class, left_button, right_button and the d_axis class.

	@param:
		opacity: How transparent should the div be
		left_btn_val: Value of the left button
		left_btn_color: Color of the left button
	 	link_index1: First link index
	 	link_index2: Second link index
	 	right_btn_val: Value of the right button
	 	right_btn_color: Color of the right button
 */

var leftButton = $("#left_button")
var rightButton = $("#right_button")
var groupClass = $(".group")

function setupInteractiveElements(selectableVars, leftBtnVal, leftBtnColor='',
						  linkIndex1, linkIndex2, rightBtnVal, rightBtnColor = ''){
	let links = leftButton.next().children().toArray()
	groupClass.css('opacity', 0)
	leftButton.val(leftBtnVal)
	leftButton.css('color', leftBtnColor)
	leftButton.html($(links[linkIndex1]).children().html() + ' <span class="caret" style="color:black"><span>')
	rightButton.val(rightBtnVal)
	rightButton.css('color', rightBtnColor)
	rightButton.html($(links[linkIndex2]).children().html() + ' <span class="caret" style="color:black"><span>')
	changeOpacity()
	if (selectableVars==0){
		$(".d_axis li:nth-child(n+3)").each(function () { $(this).hide() })
	} else {
		$(".d_axis li:nth-child(n+3)").each(function () { $(this).show() })
	}
}

// This is a helper function to bound href and class to an object
/*
	@param:
		href_a1: boolean if href should be set
		href_a2: boolean if href should be set
		href_a3: boolean if href should be set
		check_a1: boolean if object should be of class glyphicon-check
		check_a2: boolean if object should be of class glyphicon-check
		check_a3: boolean if object should be of class glyphicon-check
*/
function setupExercise(hrefA1=false, hrefA2=false, hrefA3=false,
				checkA1=false, checkA2=false, checkA3=false){
	let glyExer1 = $('#gly_exer1')
	let glyExer2 = $('#gly_exer2')
	let glyExer3 = $('#gly_exer3')

	if (hrefA1){ glyExer1.next().attr('href', '#aufgabe1') }
	if (hrefA2){ glyExer2.next().attr('href', '#aufgabe2') }
	if (hrefA3){ glyExer3.next().attr('href', '#aufgabe3') }

	const GLYPHICONCLASS =  'glyphicon glyphicon-check'
	if (checkA1){ glyExer1.attr('class', GLYPHICONCLASS) }
	if (checkA2){ glyExer2.attr('class', GLYPHICONCLASS) }
	if (checkA3){ glyExer3.attr('class', GLYPHICONCLASS) }
}

/*
	This is a helper function, it disables specific Start and download Buttons
	@param:
		disableStart1-Start3: boolean, disable start button {1-3}
		disableDownload1-Download3: boolean, disable download button {1-3}
*/
function disableStartDownloadBtn(
				disableStart1=false, disableStart2=false, disableStart3=false,
				disableDownload1=false, disableDownload2=false, disableDownload3=false){
	$('#start1').prop('disabled', disableStart1)
	$('#start2').prop('disabled', disableStart2)
	$('#start3').prop('disabled', disableStart3)
	$('#download1').prop('disabled', disableDownload1)
	$('#download2').prop('disabled', disableDownload2)
	$('#download3').prop('disabled', disableDownload3)
}

// Checkif the given parameter is a boolean
function isParamBool(param){
	return param == true || param == false
}

// helper function: hide or show objects: if parameter value is true show object
function showExGiftSol(exercise1, exercise2, exercise3,gift1, gift2, gift3, solution1, solution2, solution3){
	showExercise(exercise1, exercise2, exercise3)
	showGift(gift1, gift2, gift3)
	showSolution(solution1, solution2, solution3)
	$(".d_axis li:nth-child(n+3)").each(function () { $(this).hide() })
}
function showGift(showGift1, showGift2, showGift3){
	let gift1 = $("#belohnung1")
	let gift2 = $("#belohnung2")
	let gift3 = $("#belohnung3")

	if (showGift1 == true){ gift1.show() }
	else { gift1.hide() }

	if (showGift2 == true){ gift2.show() }
	else { gift2.hide() }

	if (showGift3 == true){ gift3.show() }
	else { gift3.hide() }
}
function showExercise(showExercise1, showExercise2, showExercise3){
	let exer1 = $('#exer1')
	let exer2 = $('#exer2')
	let exer3 = $('#exer3')

	if (showExercise1 == true){ exer1.show() }
	else{ exer1.hide() }

	if (showExercise2 == true){ exer2.show() }
	else{ exer2.hide() }

	if (showExercise3 == true){  exer3.show() }
	else{ exer3.hide() }
}
function showSolution(showSolution1, showSolution2, showSolution3){
	let solution1 =  $('#solution1')
	let solution2 =  $('#solution2')
	let solution3 =  $('#solution3')

	if (showSolution1 == true){ solution1.show() }
	else { solution1.hide() }

	if (showSolution2 == true){ solution2.show() }
	else { solution2.hide() }

	if (showSolution3 == true){ solution3.show() }
	else { solution3.hide() }
}


// helper function: Check if input is complete
function isInputIncomplete(complete=true, sol, name='sol1'){
	$("input[" + name + "]").each(function (index, obj) { 
		sol[obj.id] = obj.value
		if (obj.value == '' && complete == true) {
			BootstrapDialog.alert('Ihre Eingaben sind unvollständig.')
			complete = false
		}
	})
	return complete
}

// helper function: 
function interpolateLineData(interpolation){
	let i = 0
	data.forEach(function (da) {
		lines[i].interpolate(interpolation)
		da.path.attr('d', lines[i])
		i++
	})
}

// helper function:
function interpolateLine(interpolation){
	let i = 0
	scales.forEach(function () {
		lines[i].interpolate(interpolation)
		i++
	})
}

disableStartDownloadBtn()

$(document).ready(function () {
	let exercise1 = $('#aufgabe1')
	let exercise2 = $('#aufgabe2')
	let exercise3 = $('#aufgabe3')
	let choose1 = $('#choose1')
	let choose2 = $('#choose2')
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab2/init/',
		contentType: false,
		processData: false,
		dataType: 'json'
	}).done(function (data) {
		// evaluate in which step the user is
		switch (data['step']) {
			case 0:
				exercise1.attr('class', 'panel-collapse collapse in')
				showExGiftSol(true, false, false, false, false, false, false, false, false)
				break
			case 1:
				exercise1.attr('class', 'panel-collapse collapse in')
				showExGiftSol(true, false, false, false, false, false, true, false, false)
				break
			case 3:
				exercise1.attr('class', 'panel-collapse collapse')
				showExGiftSol(false, true, false, true, false, false, false, true, false)
				setupExercise(true, true, false, true)
				choose1.attr('id', 'dump1')
				choose2.attr('id', 'choose1')
				$('#aufgabe2').attr('class', 'panel-collapse collapse in')
				break
			case 5:
				choose1.attr('id', 'dump1')
				choose2.attr('id', 'choose1')
				exercise1.attr('class', 'panel-collapse collapse')
				showExGiftSol(false, false, true, true, true, false, false, false, false)
				setupExercise(true, true, true, true, true)
				exercise3.attr('class', 'panel-collapse collapse in')
				interpolateLine('step-after')
				break
			case 6:
				choose1.attr('id', 'dump1')
				choose2.attr('id', 'choose1')
				exercise1.attr('class', 'panel-collapse collapse')
				setupExercise(true, true, true, true, true)
				exercise3.attr('class', 'panel-collapse collapse in')
				showExGiftSol(false, false, true, true, true, false, false, false, true)
				interpolateLine('step-after')
				break
			case 7:
				exercise1.attr('class', 'panel-collapse collapse')
				choose1.attr('id', 'dump1')
				choose2.attr('id', 'choose1')
				setupExercise(true, true, true, true, true, true)
				exercise3.attr('class', 'panel-collapse collapse in')
				showExGiftSol(false, false, true, true, true, true, false, false, false)
				setupInteractiveElements(1, 2, 'grey', 2, 4, 4, 'red')
				MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('left_button')])
				MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('right_button')])
				interpolateLine('step-after')
				break
		}
	})

	// Setup page If aufgabe1 is about to be opened
	exercise1.on('show.bs.collapse', function () {
		setupInteractiveElements(1, 0, 'blue', 0, 2, 2, 'grey')
		//$(".d_axis li:nth-child(n+3)").each(function () { $(this).show() })
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab2/change/',
			data: JSON.stringify(0),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == false) {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
		})
		exercise2.collapse('hide')
		exercise3.collapse('hide')
		interpolateLineData('cardinal')
	})
	// Setup page If aufgabe2 is about to be opened
	exercise2.on('show.bs.collapse', function () {
		setupInteractiveElements(0, 0, 'blue', 0, 1, 1, 'green')
		//$(".d_axis li:nth-child(n+3)").each(function () { $(this).hide() })

		$.ajax({
			type: 'POST',
			url: mainroute + '/lab2/change/',
			data: JSON.stringify(1),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				if (data['done'] == true) {

					setupInteractiveElements(1, 2, 'grey', 2, 4, 4, 'red')
					//$(".d_axis li:nth-child(n+3)").each(function () { $(this).show() })
				}
			} else {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
		})
		exercise3.collapse('hide')
		exercise1.collapse('hide')
		interpolateLineData('cardinal')
	})

	// Setup page If aufgabe3 is about to be opened
	exercise3.on('show.bs.collapse', function () {
		interpolateLineData('step-after')

		//setupInteractiveElements(0, 0, 'blue', 0, 1, 1, 'green')
		//$(".d_axis li:nth-child(n+3)").each(function () { $(this).hide() })

		$.ajax({
			type: 'POST',
			url: mainroute + '/lab2/change/',
			data: JSON.stringify(2),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				if (data['done'] == true) {
					setupInteractiveElements(1, 2, 'grey', 2, 4, 4, 'red')
					//$(".d_axis li:nth-child(n+3)").each(function () { $(this).show() })
				}
			} else {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
		})
		exercise1.collapse('hide')
		exercise2.collapse('hide')
		interpolateLineData('step-after')
	})

	$('#reset1').click(function (event) {
		event.preventDefault()
		disableStartDownloadBtn(true, true, true, true, true, true)
		$.ajax({
			type: 'GET',
			url: mainroute + '/lab2/reset/',
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function (data) {
			disableStartDownloadBtn()
			let wasSuccessful = data['success'] == true
			if (!wasSuccessful) {
				BootstrapDialog.alert(data['resp'])
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.'))
			disableStartDownloadBtn()
		})
	})

	$('#start1').click(function (event) {
		event.preventDefault()
		disableStartDownloadBtn(true, true, true, true, true, true)
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab2/start1/',
			data: JSON.stringify($("#choose1").text()),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			disableStartDownloadBtn()
			if (data['success'] == true) {
				BootstrapDialog.alert(data['resp'])
				if (data['alldone']) {
					$('#solution1').show()
				}
			}
			else {
				BootstrapDialog.alert(data['resp'])
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			disableStartDownloadBtn()
		})
	})

	$('#send1').click(function (event) {
		event.preventDefault()
		let sol1 = {}
		let complete = isInputIncomplete(true, sol1, 'sol1')

		if (complete) {
			$.ajax({
				type: 'POST',
				url: mainroute + '/lab2/send1/',
				data: JSON.stringify(sol1),
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					BootstrapDialog.alert(data['resp'])
					choose1.attr('id', 'dump1')
					choose2.attr('id', 'choose1')
					showExGiftSol(false, true, false, true, false, false, false, true,false )
					setupExercise(true, true, false, true)
					setupInteractiveElements(1, 0, 'blue', 0, 2, 2, 'grey')
				}
				else {
					BootstrapDialog.alert(data['resp'])
				}
			}).fail(function () {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			})
		}
	})

	$('#start2').click(function (event) {
		event.preventDefault()
		disableStartDownloadBtn(true, true, true, true, true, true)
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab2/start2/',
			data: JSON.stringify($('input[winkel]').val()),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				disableStartDownloadBtn()
				BootstrapDialog.alert(data['resp'])
				if (data['alldone']) {
					$('#solution1').show()
				}
			}
			else {
				BootstrapDialog.alert(data['resp'])
				disableStartDownloadBtn()
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			disableStartDownloadBtn()
		})
	})

	$('#send2').click(function (event) {
		event.preventDefault()
		let sol2 = {}
		let complete = isInputIncomplete(true, sol2, 'sol2')
		if (complete) {
			$.ajax({
				type: 'POST',
				url: mainroute + '/lab2/send2/',
				data: JSON.stringify(sol2), 
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					BootstrapDialog.alert(data['resp'])
					exercise1.attr('class', 'panel-collapse collapse')
					showExGiftSol(false, false, true, true, true, false, false, false, false)
					setupExercise(true, true, true, true, true)
					setupInteractiveElements(1, 2, 'grey', 2, 4, 4, 'red')
				}
				else {
					BootstrapDialog.alert(data['resp'])
				}
			}).fail(function () {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			})
		}
	})

	$('#start3').click(function (event) {
		event.preventDefault()
		interpolateLineData('step-after')
		disableStartDownloadBtn(true, true, true, true, true, true)
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab2/start3/',
			data: JSON.stringify({ "Profil": $("#choose3").val(), "bit": $('input[bitbreite]').val() }),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				disableStartDownloadBtn()
				BootstrapDialog.alert(data['resp'])
				if (data['alldone']) {
					$('#solution3').show()
				}
			}
			else {
				BootstrapDialog.alert(data['resp'])
				disableStartDownloadBtn()
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			disableStartDownloadBtn()
		})
	})

	$('#send3').click(function (event) {
		event.preventDefault()
		let sol3 = {}
		let complete = isInputIncomplete(true, sol3, 'sol3')

		if (complete) {
			$.ajax({
				type: 'POST',
				url: mainroute + '/lab2/send3/',
				data: JSON.stringify(sol3),
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					BootstrapDialog.alert(data['resp'])
					exercise1.attr('class', 'panel-collapse collapse')
					showExGiftSol(false, false, true, true, true, true, false, false, false)
					setupExercise(true, true, true, true, true, true)
					$('#aufgabe3').attr('class', 'panel-collapse collapse in')
					setupInteractiveElements(0, 2, 'grey', 2, 4, 4, 'red')
				}
				else {
					BootstrapDialog.alert(data['resp'])
				}
			}).fail(function () {
				BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			})
		}
	})

	// helper function: create event if download button was clicked
	function bindButtonTo(download){
		$('#'+download).click(function () {
			window.open(mainroute + "/lab2/download/" + (new Date()).valueOf())
		})
	}

	bindButtonTo('download1')
	bindButtonTo('download2')
	bindButtonTo('download3')
})
