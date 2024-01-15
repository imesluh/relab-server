// This .js is handling incoming messages
// dev socketio
var socket = io('/data', {  path: "/RobotikI/rest/be/CI/socket.io", transports: ['websocket']});	// erzwingt transport method websocket. Verbindungsaufbau aber langsamer (?)
var bWebsocket_connected = false;
$(document).ready(function () {       
        //const socket = io('/data', {  path: "/MechSys/rest/be/CI/socket.io" });	// Verbindung wird zunächst mit transport method 'polling' aufgebaut und nach upgrade-request auf 'websocket' umgestellt. Kann u.U. serverseitig zu Problemen führen, da Funktionen durch connect-event bereits getriggert werden, das Upgrade auf 'websocket' allerdings noch nicht stattgefunden hat.
        
        
        // Event handler for new connections.
        // The callback function is invoked when a connection with the
        // server is established.
        socket.on('connect', function() {
        	//setTimeout(funcion(){
        	//	socket.emit('my_test', {data: 'I am connected!'})
        	//	console.log('socket io connected!')
        	//}, 2000)
        	socket.emit('my_connect');	//  custom connect-event
        	console.log('socket io connected!')
        	console.log('Transport method: ', socket.io.engine.transport.name)
        	bWebsocket_connected = true;
	})
	
	socket.on('disconnect', function() {
		console.log('Websocket-Verbindung disconnected!')
	})
	
	var clockPlace = document.getElementById('clock')
	var ready = false
	
	// ++++++++++  handling server events
	socket.on('Data_stream', function(msg) {
		var message = JSON.parse(msg)
		let i = 0
		data.forEach(function (da) {
			// [TODO] proof with real data stream
			da.value = message.Value[i]
			//da.value = message.Value
			i++
		})
	})
	
	socket.on('Ready', function(msg) {
		var message = JSON.parse(msg)
		if (ready == false && message.Value == true) {
			$('#bt_start1').prop('disabled', false)
			$('#bt_start2').prop('disabled', false)
			$('.download').prop('disabled', false)

		}
	})
	
	socket.on('Clock', function(msg) {		// if time is almost over
		socket.emit('ws_to_ping')		// answer server to reset the timeout value (client is still alive)
		var message = JSON.parse(msg)
		clockPlace.innerHTML = message.Value
		const lastMinutes = '05:00'
		const lastMinute = '01:00'
		if (message.Value == lastMinutes) {
			BootstrapDialog.alert("Es bleiben Ihnen noch 5 Minuten.")
		}
		else if (message.Value == lastMinute) {
			BootstrapDialog.alert("Es beginnt die letzte Minute.")
		}
		//console.log('Event Clock - message value:' , message.Value)
	})
	
	socket.on('Disco', function() {
		location.reload(true)
		console.log('Event Disco')
	})
	
	socket.on('Blocked', function() {
		window.location = '/static/html/blocked.html'
		console.log('Blocked')
	})
	
	// When website is about to being closed
	window.onbeforeunload = function () {
//		socketData.send(JSON.stringify({ 'Content': 'Disconnect' }))
		socket.emit('Disconnect');
		janus.destroy()
	}
})
