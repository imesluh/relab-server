
$(document).ready(function () {
	var gId = -1
	var duration = 30
	//var socketData = new WebSocket('wss://' + document.domain + ':' + location.port + mainroute + '/data/')
	//window.onbeforeunload = function () {
	//	socketData.send(JSON.stringify({ 'Name': 'Disconnect' }))
	//}
	// page is ready
	var calendar = $('#calendar').fullCalendar({
		selectable: true,
		selectHelper: false,
		selectOverlap: function (event) {
			return event.rendering === 'inverse-background'
		},
		eventOverlap: function (event) {
			return event.rendering === 'inverse-background'
		},
		businessHours: false,
		editable: false,
		defaultView: 'agendaWeek',
		timeFormat: 'H:mm',
		displayEventTime: false,
		firstDay: 1,
		allDaySlot: false,
		slotMinutes: 30,
		slotDuration: '00:30:00',
		snapDuration: '00:30:00',
		//slotLabelInterval: 30,
		minTime: '00:30:00',	// first avaiable time slot 
		defaultTimedEventDuration: '00:'+ duration.toString() + ':00',
		timezone: "Europe/Berlin",
		nowIndicator: true,

		select: function (start, end) {
			var fullCalModal = $('#fullCalModal')
			var ddButton = $("#dd-button")
			if (gId == 1000) { // sucessfull booking
				$('#book-btn').unbind("click").click(function (e) {
					e.preventDefault()
					let sendData = JSON.stringify({ 'Name': 'Create', 'Date': [start.format('YYYY MM DD H mm'), end.format('YYYY MM DD H mm')], 'Lab': ddButton.text() })
					$.ajax({
						type: 'POST',
						url: mainroute + '/create/',
						data: sendData,
						contentType: "application/json",
						processData: false,
						dataType: 'json'
					}).done(function (data) {
						if (data.success == true) {
							//socketData.send(sendData)
							$('#calendar').fullCalendar('renderEvent', 
								{ id: gId, title: 'admin', start: start, end: end, 
									startEditable: true, allDay: false, backgroundColor: '#3CB371'}, true
								)
							if (data.remain !== '1') { BootstrapDialog.alert('Die Buchung war erfolgreich. Sie haben noch ' + data.remain + ' Versuche.') }
							else { BootstrapDialog.alert('Die Buchung war erfolgreich. Dies ist Ihr letzter Versuch.') }
						}
						else {
							BootstrapDialog.alert(data.resp)
						}
					}).fail(function () {
						BootstrapDialog.alert(unescape('Der Server ist nicht erreichbar.'))
					})
					fullCalModal.modal({ show: false })
					fullCalModal.modal('hide')

				})
				$(".dropdown-menu li a").click(function () {
					ddButton.html($(this).text() + ' <span class="caret"><span>')
					ddButton.val($(this).text())
				})

				fullCalModal.modal({ show: true })
				calendar.fullCalendar('unselect')
			}
			else {
				if (moment(start) > endLabor + duration*60*1000) {
					BootstrapDialog.alert('Bitte wählen Sie einen Termin vor dem ' + endLabor.format('DD.MM.YYYY') + ' um ' + endLabor.format('H:mm') + '.')
					fullCalModal.modal({ show: false })
					fullCalModal.modal('hide')
				}
				else if (moment(start) <= startLabor + duration*60*1000) {
					BootstrapDialog.alert('Bitte wählen Sie einen Termin nach dem ' + startLabor.format('DD.MM.YYYY') + ' um ' + startLabor.format('H:mm') + '.')
					fullCalModal.modal({ show: false })
					fullCalModal.modal('hide')
				}
				else if (moment(start) <= moment() + duration*60*1000) {
					BootstrapDialog.alert('Der gewünschte Termin liegt in der Vergangenheit.')
					fullCalModal.modal({ show: false })
					fullCalModal.modal('hide')
				}
				else {
					$('.book-btn').unbind("click").click(function (e) {
						e.preventDefault()
						let sendData = JSON.stringify({ 'Name': 'Create', 'Date': start.format('YYYY MM DD H mm'), 'Lab': ddButton.text() })
						$.ajax({
							type: 'POST',
							url: mainroute + '/create/',
							data: sendData,
							contentType: "application/json",
							processData: false,
							dataType: 'json'
						}).done(function (data) {
							if (data.success == true) {
								//socketData.send(sendData)
								$('#calendar').fullCalendar('renderEvent', 
								{ id: gId, title: ddButton.text(), start: start, end: start+duration*60*1000, 
									startEditable: true, allDay: false, backgroundColor: '#3CB371'}, true
								)
								if (data.remain !== '1') { BootstrapDialog.alert('Die Buchung war erfolgreich. Sie haben noch ' + data.remain + ' Versuche.') }
								else { BootstrapDialog.alert('Die Buchung war erfolgreich. Dies ist Ihr letzter Versuch.') }
							}
							else {
								BootstrapDialog.alert(data.resp)
							}
						}).fail(function () {
							BootstrapDialog.alert(unescape('Der Server ist nicht erreichbar.'))
						})
						fullCalModal.modal({ show: false })
						fullCalModal.modal('hide')

					})
					$(".dropdown-menu li a").click(function () {
						ddButton.html($(this).text() + ' <span class="caret"><span>')
						ddButton.val($(this).text())
					})

					fullCalModal.modal({ show: true })
					calendar.fullCalendar('unselect')
				}
			}
		},
		eventClick: function (event) {
			if (parseInt(event.id) == gId) { // user clicked on his booking
				BootstrapDialog.confirm("Möchten Sie die Reservierung löschen?", function (result) {
					if (result) {
						let sendData = JSON.stringify({ 'Name': 'Delete', 'ID': gId })
						$.ajax({
							type: 'POST',
							url: mainroute + '/delete/',
							data: sendData,
							contentType: "application/json",
							processData: false,
							dataType: 'json'
						}).done(function (data) {
							if (data.success == true) {
								$('#calendar').fullCalendar('removeEvents', gId)
								//socketData.send(sendData)
							}
							else {
								BootstrapDialog.alert(data.resp)
							}
						}).fail(function () {
							BootstrapDialog.alert(unescape('Der Server ist nicht erreichbar.'))
						})
					}
				})
			}
		},
		eventDrop: function (event, delta, revertFunc) {
			if (moment(event.start) > endLabor + duration*60*1000) {
				BootstrapDialog.alert('Bitte wählen Sie einen Termin vor dem ' + endLabor.format('DD.MM.YYYY') + ' um ' + endLabor.format('H:mm') + '.')
				revertFunc()
			}
			else if (moment(event.start) <= startLabor + duration*60*1000) {
				BootstrapDialog.alert('Bitte wählen Sie einen Termin nach dem ' + startLabor.format('DD.MM.YYYY') + ' um ' + startLabor.format('H:mm') + '.')
				revertFunc()
			}
			else if (moment(event.start) <= moment() + duration*60*1000) {
				BootstrapDialog.alert('Der gewünschte Termin liegt in der Vergangenheit.')
				revertFunc()
			}
			else {
				BootstrapDialog.confirm("Möchten Sie den Versuchsstand für den " + event.start.format('DD.MM.YYYY') + ' um ' + event.start.format('H:mm') + " buchen?", function (result) {
					if (result) {
						let sendData = JSON.stringify({ 'Name': 'Change', 'Date': event.start.format('YYYY MM DD H mm') })
						$.ajax({
							type: 'POST',
							url: mainroute + '/change/',
							data: sendData,
							contentType: "application/json",
							processData: false,
							dataType: 'json'
						}).done(function (data) {
							if (data.success == true) {
								//socketData.send(sendData)
							}
							else {
								revertFunc()
								BootstrapDialog.alert(data.resp)
							}
						}).fail(function () {
							revertFunc()
							BootstrapDialog.alert(unescape('Der Server ist nicht erreichbar.'))
						})
					}
					else { revertFunc() }
				})
			}
		},
		header: {
			left: 'prev today',
			center: 'title',
			right: 'today next'
		},      // calendar properties
		events: [
			{
				start: moment.max(moment(), startLabor),
				end: endLabor,
				rendering: 'inverse-background',
				startEditable: false,
				backgroundColor: 'gray'
			},
			{
				title: 'blocked',
				start: '2022-04-29T18:00:00',
				end: '2022-04-29T23:00:00',
				startEditable: false,
				backgroundColor: 'gray'
			},
			{
				title: 'Bin in der Übung!',
				start: '2019-12-05T13:00:00',
				end: '2019-12-05T17:00:00',
				startEditable: false,
				backgroundColor: 'gray'
			},
			{
				title: 'Bin in der Übung!',
				start: '2019-12-12T13:00:00',
				end: '2019-12-12T17:00:00',
				startEditable: false,
				backgroundColor: 'gray'
			},
			{
				title: 'Bin in der Übung!',
				start: '2020-01-20T13:00:00',
				end: '2020-01-20T16:30:00',
				startEditable: false,
				backgroundColor: 'gray'
			},
			{
				title: 'Bin in der Übung!',
				start: '2020-01-27T13:00:00',
				end: '2020-01-27T17:00:00',
				startEditable: false,
				backgroundColor: 'gray'
			}
		]
	})
	// handle incoming messages
	//socketData.onmessage = function (msg) {
	//	let message = JSON.parse(msg.data)
	//	if (message.Name == 'Fail') { BootstrapDialog.alert(message.Message) }
	//	else if (message.Name == 'Event') {
	//		$('#calendar').fullCalendar('renderEvent', 
	//			{ id: message.ID, title: message.Title, start: message.Start, end: message.End, 
	//				startEditable: message.Edit, allDay: false, backgroundColor: message.Color }, true
	//		)
	//	}
	//	else if (message.Name == 'Delete') {
	//		$('#calendar').fullCalendar('removeEvents', message.ID)
	//	}
	//	else if (message.Name == 'Blocked') {
	//		BootstrapDialog.alert(unescape('Ihre Gruppe hat diese Seite bereits in einem anderen Fenster geöffnet. Dieses Fenster wird im Falle von Reservierungen nicht aktualisiert.'))
	//	}
	//}
	$.ajax({
		type: 'GET',
		url: mainroute + '/init/',
		contentType: "application/json",
		processData: false,
		dataType: 'json'
	}).done(function (data) {
		console.log("calendar.js: HIER")
		if (data.success == true) {
			if (data.newname == true) {
				BootstrapDialog.show({
					title: 'Neuer Guppenname',
					message: 'Wählen Sie bitte einen Gruppennamen: <input type="text" id="groupname" maxlength="30"/>',
					closable: false,
					buttons: [{
						label: 'Bestätigen',
						cssClass: 'btn-primary',
						hotkey: 13, // Enter.
						action: function (dialogRef) {
							$.ajax({
								type: 'POST',
								url: mainroute + '/groupname/',
								contentType: 'application/json',
								data: JSON.stringify({ 'Name': $('#groupname').val() }),
								processData: false,
								dataType: 'json'
							}).done(function (data) {
								if (data.success == true) {
									dialogRef.close()
								}
								else {
									BootstrapDialog.alert(unescape('Ihr Gruppenname ist bereits vergeben.'))
								}
							}).fail(function () {
								BootstrapDialog.alert(unescape('Ihr Gruppenname konnte nicht eingetragen werden. Möglicherweise ist er bereits vergeben.'))
							})
						}
					}]
				})
			}
			let events = data.resp
			gId = data.g_id
			let i
			for (i = 0; i < events.length; i++) {
				let event = JSON.parse(events[i])
				$('#calendar').fullCalendar('renderEvent', { id: event.ID, title: event.Title, start: event.Start, end: event.End, startEditable: event.Edit, allDay: false, backgroundColor: event.Color }, true)
			}
		}
		else {
			BootstrapDialog.alert(data.resp)
		}
	}).fail(function () {
		BootstrapDialog.alert(unescape('Der Server ist nicht erreichbar.'))
	})
	$(document).keydown(function (e) {
		if (e.keyCode == 46) { // delete key was pushed
			BootstrapDialog.confirm("Möchten Sie die Reservierung löschen", function (result) {
				if (result) {
					let sendData = JSON.stringify({ 'Name': 'Delete', 'ID': gId })
					$.ajax({
						type: 'POST',
						url: mainroute + '/delete/',
						data: sendData,
						contentType: "application/json",
						processData: false,
						dataType: 'json'
					}).done(function (data) {
						if (data.success == true) {
							$('#calendar').fullCalendar('removeEvents', gId)
							//socketData.send(sendData)
						}
						else {
							BootstrapDialog.alert(data.resp)
						}
					}).fail(function () {
						BootstrapDialog.alert(unescape('Der Server ist nicht erreichbar.'))
					})
				}
			})
		}
	})
})
