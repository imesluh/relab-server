function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms)) 
}


$(".choose_dd li a").click(function () {
	var ddButton = $(this).parent().parent().prev()
	if (!ddButton.is('button')) {
		if (ddButton.prev().is('button')) {
			ddButton = ddButton.prev()
		} else { alert('Wenden Sie sich bitte an den Systemadministrator')  }
	}
	ddButton.html('<font>' + $(this).html() + '</font><span class="caret" style="color:black "></span>')
	var index = $(this).parent().index() 
	ddButton.attr('value', index)

	// if stream quality dropdown is being clicked
	if (ddButton.attr('id') == "stream_select") {

		var id = parseInt($('#stream_select').attr('value')) + 1 
		var body = { "request": "switch", id:id } 
		streaming.send({ "message": body }) 
		setTimeout(function () {
			var body = { "request": "watch", id: id } 
			streaming.send({ "message": body }) 

		}, 500) 
	}
}) 
