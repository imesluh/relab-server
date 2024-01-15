/*
	This is a helper function, it disables specific Start and download Buttons
	@param:
		disableStart1-Start3: boolean, disable start button {1-3}
		disableDownload1-Download3: boolean, disable download button {1-3}
 */
function disableStartDownloadBtn(
				disableStart1=false, disableStart2=false,
				disableDownload1=false, disableDownload2=false){
	$('#start1').prop('disabled', disableStart1)
	$('#start2').prop('disabled', disableStart2)
	$('#download1').prop('disabled', disableDownload1)
	$('#download2').prop('disabled', disableDownload2)
}

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
	 	rightBtnColor: Color of the right button
 */



function setupInteractiveElements(opacity, leftBtnVal, leftBtnColor='',
						  			 linkIndex1, linkIndex2, rightBtnVal, rightBtnColor = ''){
		let leftButton = $("#left_button")
		let rightButton = $("#right_button")
		let links = leftButton.next().children().toArray()
		$('.group').css('opacity', opacity) 
		leftButton.val(leftBtnVal)
		leftButton.css('color', leftBtnColor)
		leftButton.html($(links[linkIndex1]).children().html() + ' <span class="caret" style="color:black "><span>')
		rightButton.val(rightBtnVal)
		rightButton.css('color', rightBtnColor)
		rightButton.html($(links[linkIndex2]).children().html() + ' <span class="caret" style="color:black "><span>')
		changeOpacity()
}


disableStartDownloadBtn()//true, true, true, true) 

$(function () {

	let exercise1 = $("#aufgabe1")
	let exercise2 = $("#aufgabe2")

	exercise1.on('hidden.bs.collapse', function () {
		exercise2.collapse('show')
		setupInteractiveElements(0, 2, 'grey', 2, 3, 3, 'orange')
	})
	exercise1.on('show.bs.collapse', function () {
		exercise2.collapse('hide')
		setupInteractiveElements(0, 1, 'green', 1, 4, 4, 'red')
	})
	exercise2.on('hidden.bs.collapse', function () {
		exercise1.collapse('show')
		setupInteractiveElements(0, 1, 'green', 1, 4, 4, 'red')
	})
	exercise2.on('show.bs.collapse', function () {
		exercise1.collapse('hide')
		setupInteractiveElements(0, 2, 'grey', 2, 3, 3, 'orange')
	})

	$('#reset1').click(function (event) {
		event.preventDefault() 
		disableStartDownloadBtn(true, true, true, true) 
		let formData = new FormData()
		$.ajax({
			type: 'GET',
			url: mainroute + '/lab3/reset/',
			data: formData,
			contentType: false,
			processData: false,
			dataType: 'json'
		}).done(function (data) {
			disableStartDownloadBtn(false, false, false, false)
			if (data['success'] == true) {
			}
			else {
				BootstrapDialog.alert(data['resp']) 
				disableStartDownloadBtn(false, false, false, false) 
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.')) 
			disableStartDownloadBtn(false, false, false, false) 
		}) 
	}) 

	$('#start1').click(function (event) {
		event.preventDefault() 
		disableStartDownloadBtn(true, true, true, true) 
		let complete = true
		let gtp = {}
		$("input[gtp]").each(function (index, obj) {
			gtp[obj.id] = obj.value
			if (obj.value == '' && complete == true) {
				BootstrapDialog.alert('Ihre Eingaben sind unvollständig.') 
				complete = false 
				disableStartDownloadBtn(false, false, false, false) 
			}
		}) 
		if (complete) {
			$.ajax({
				type: 'POST',
				url: mainroute + '/lab3/start1/',
				data: JSON.stringify(gtp),
				contentType: "application/json",
				dataType: 'json'
			}).done(function (data) {
				if (data['success'] == true) {
					if (data['alldone'] == true) { $('#gly_exer1').attr('class', 'glyphicon glyphicon-check')  }
					BootstrapDialog.show({
						message: data['resp'],
						closable: false,
						buttons: [{
							label: 'OK',
							cssClass: 'btn-default',
							action: function (dialogRef) { dialogRef.close()  }
						}],
						onshown: function () {
							var popup = document.getElementsByClassName('bootstrap-dialog') 
							MathJax.Hub.Queue(['Typeset', MathJax.Hub, popup]) 
						}
					}) 
				} else {
					BootstrapDialog.show({
						message: data['resp'],
						closable: false,
						buttons: [{
							label: 'OK',
							cssClass: 'btn-default',
							action: function (dialogRef) { dialogRef.close()  }
						}],
						onshown: function () {
							let popup = document.getElementsByClassName('bootstrap-dialog')
							MathJax.Hub.Queue(['Typeset', MathJax.Hub, popup]) 
						}
					}) 
				}
				disableStartDownloadBtn(false, false, false, false)
			}).fail(function () {
				BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.')) 
				disableStartDownloadBtn(false, false, false, false) 
			}) 
		}
	}) 

	$('#download1').click(function () {
		window.open(mainroute + "/lab3/download/" + (new Date()).valueOf()) 
	}) 
}) 
