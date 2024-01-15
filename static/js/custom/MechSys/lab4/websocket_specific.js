$(document).ready(function () {
	//var socketData = new WebSocket('wss://' + document.domain + ':' + location.port + mainroute + '/lab4/data/')
	var clockPlace = document.getElementById('clock')
	let btAccep1 = $('#bt_accept1')
	btAccep1.click(function (event) {
		event.preventDefault()
		if (btAccep1.text() == "Change") {
			socket.emit('x_vor', {data: [0]});
		}
	})
	$('#challenge').click(function (event) {
		event.preventDefault()
		socket.emit('x_vor', {data: [0]});
	})
	let divVorgabe = $("div[x_vorgabe]")
	divVorgabe.on("slide", function (event, ui) {
		let sendData = new Array(divVorgabe.length)
		let posSatisfied = true
		if (Math.abs(parseFloat(ui.value)) > 0.2) {
			posSatisfied = false
		}
		sendData[0] = parseFloat(ui.value)
		if (posSatisfied) {
			socket.emit('x_vor', {data: sendData});
		}
	})
	let inputVorgabe = $("input[x_vorgabe]")
	inputVorgabe.keydown(function (e) {
		if (e.keyCode == 13) {
			let sendData = new Array(divVorgabe.length)
			let posSatisfied = true
			inputVorgabe.each(function (index, obj) {
				if (Math.abs(parseFloat($(obj).val())) > 0.2) {
					posSatisfied = false
				}
				sendData[index] = parseFloat($(obj).val())
			})
			if (posSatisfied) {
				socket.emit('x_vor', {data: sendData});
			}
		}
	})

	function posSatisfied(){
		let sendData = new Array(divVorgabe.length)
		let posSatisfied = true
		inputVorgabe.each(function (index, obj) {
			if (Math.abs(parseFloat($(obj).val())) > 0.2) {
				posSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val())
		})
		if (posSatisfied) {
			socket.emit('x_vor', {data: sendData});
		}
	}

	inputVorgabe.focusout(function () {
		posSatisfied()
	})

	let inputPolS = $('input[pol_s]')
	let divPolS = $("div[pol_s]")

	divPolS.on("slide", function () {
		let sendData = new Array(divPolS.length + 1)
		let polSatisfied = true
		inputPolS.each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val())) || parseFloat($(obj).val()) >= 0) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val())
		})
		sendData[$('input[pole]').length] = $('#check1').is(":checked")
		socket.emit('rueck', {data: sendData});
	})
	
	divPolS.on("slidestop", function () {
		let sendData = new Array(divPolS.length + 1)
		let polSatisfied = true
		inputPolS.each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val())) || parseFloat($(obj).val()) >= 0) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val())
		})
		sendData[$('input[pole]').length] = $('#check1').is(":checked")
		socket.emit('rueck', {data: sendData});
	})

	inputPolS.focusout(function () {
		let sendData = new Array($('div[pol_s]').length + 1)
		let polSatisfied = true
		$('input[pol_s]').each(function (index, obj) {
			if (isNaN(parseFloat($(obj).val())) || parseFloat($(obj).val()) >= 0) {
				polSatisfied = false
			}
			sendData[index] = parseFloat($(obj).val())
		})
		sendData[$('input[pole]').length] = $('#check1').is(":checked")
		socket.emit('rueck', {data: sendData});
	})
	inputPolS.keydown(function (e) {
		if (e.keyCode == 13) {
			let sendData = new Array($('div[pol_s]').length + 1)
			let polSatisfied = true
			$('input[pol_s]').each(function (index, obj) {
				if (isNaN(parseFloat($(obj).val())) || parseFloat($(obj).val()) >= 0) {
					polSatisfied = false
				}
				sendData[index] = parseFloat($(obj).val())
			})
			sendData[$('input[pole]').length] = $('#check1').is(":checked")
			socket.emit('rueck', {data: sendData});
		}
	})
	socket.on('rueck', function(msg) {
		var message = JSON.parse(msg)
		$('#messagebox').html('<p> K = [' + message.Value[0] + ', ' + message.Value[1] + ', '+ message.Value[2] + ', '+ message.Value[3] + ']</p>');
	})

})
