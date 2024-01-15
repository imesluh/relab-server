$(document).ready(function () {
	var clockPlace = document.getElementById('clock')
	var ready = false

	$("div[winkel]").on("slide", function (event, ui) {
		let sendData = new Array($('div[winkel]').length)
		let polSatisfied = true
		$('input[winkel]').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val());
		})
		socket.emit('alpha', {data: sendData});
	})

	$("input[winkel]").focusout(function () {
		let sendData = new Array($('div[winkel]').length)
		let polSatisfied = true
		$('input[winkel]').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val())
		})
		socket.emit('alpha', {data: sendData});
	})

	$("input[winkel]").keydown(function (e) {
		if (e.keyCode == 13) {
			let sendData = new Array($('div[winkel]').length)
			let polSatisfied = true
			$('input[winkel]').each(function (index, obj) {
				if (isNaN(parseFloat($(obj).val()))) {
					polSatisfied = false
				}
				sendData[index] = parseFloat($(obj).val())
			})
			socket.emit('alpha', {data: sendData});
		}
	})

	$("div[bitbreite]").on("slide", function (event, ui) {
		let sendData = new Array($('div[bitbreite]').length)
		let polSatisfied = true
		$('input[bitbreite]').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val());
		})
		socket.emit('bit', {data: sendData});
	})
	$("input[bitbreite]").focusout(function () {
		let sendData = new Array($('div[bitbreite]').length)
		let polSatisfied = true
		$('input[bitbreite]').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val()))) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val())
		})
		socket.emit('bit', {data: sendData});
	})

	$("input[bitbreite]").keydown(function (e) {
		if (e.keyCode == 13) {
			let sendData = new Array($('div[bitbreite]').length)
			let polSatisfied = true
			$('input[bitbreite]').each(function (index, obj) {
				if (isNaN(parseFloat($(obj).val()))) {
					polSatisfied = false
				}
				sendData[index] = parseFloat($(obj).val())
			})
			socket.emit('bit', {data: sendData});
		}
	})
});
