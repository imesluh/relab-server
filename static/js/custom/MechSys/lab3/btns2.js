/*
	This is a helper function, it disables specific Start and download Buttons
	@param:
		disableS1-S3: boolean, disable start button {1-3}
		disableD1-D3: boolean, disable download button {1-3}
 */
function disableStartDownloadBtn(
				disableStart1=false, disableStart2=false,
				disableDownload1=false, disableDownload2=false){
	$('#start1').prop('disabled', disableStart1)
	$('#start2').prop('disabled', disableStart2)
	$('#download1').prop('disabled', disableDownload1)
	$('#download2').prop('disabled', disableDownload2)
}

$(function () {
	$(".dropdown-menu li.anregung a").click(function () {
		let ddButton = $("#dd-button")
		ddButton.html($(this).text() + ' <span class="caret"><span>') 
		ddButton.val($(this).text()) 
	}) 

	$('#reset2').click(function (event) {
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
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Der Versuchsstand konnte nicht zurückgesetzt werden.')) 
		}) 
	}) 


	$('#start2').click(function (event) {
		event.preventDefault() 
		disableStartDownloadBtn(true, true, true, true) 

		$.ajax({
			type: 'POST',
			url: mainroute + '/lab3/start2/',
			data: JSON.stringify($("#dd-button").text()),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			disableStartDownloadBtn(false, false, false, false) 
			if (data['success'] == true) {
				if (data['alldone'] == true) { $('#gly_exer2').attr('class', 'glyphicon glyphicon-check')  }
				BootstrapDialog.alert(data['resp']) 
			}
			else {
				BootstrapDialog.alert(data['resp']) 
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.')) 
			disableStartDownloadBtn(false, false, false, false) 
		}) 
	}) 


	$('#download2').click(function () {
		window.open(mainroute + "/lab3/download/" + (new Date()).valueOf()) 
	}) 
}) 
