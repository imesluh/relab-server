// implementation of hidden and visible methods
jQuery.fn.visible = function () {
	return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function () {
	return this.css('visibility', 'hidden');
};

jQuery.fn.displayNone = function () {
	return this.css('display', 'none');
};

jQuery.fn.display = function () {
	return this.css('display', 'inline');
};

jQuery.fn.disable = function() {
    return this.prop("disabled",true);;
};

jQuery.fn.enable = function() {
    return this.prop("disabled",false);;
};


//var position; // Array that contains different positions
//var deltaX_m; // array containing relative endeffector movement
//var idxTask = 1; // counter representing the current task of lab3
var idxQuiz = 0;
var bDebugMode = false;

// read input forms
function setupInput(sol) {
	if (idxQuiz < 1){
		// write input in solutions
		let q_target_deg = [];

		let q1 = parseFloat($('#q1_target').val());
		let q2 = parseFloat($('#q2_target').val());
		let q3 = parseFloat($('#q3_target').val());
		q_target_deg.push([q1, q2, q3]);

		sol['q_target_deg'] = q_target_deg;
	} else {
		let bChecked = [];
		for (let j = 0; j < 5; j++) {
			// save the input
			bChecked.push(document.getElementById("quiz-checkbox" + j).checked);
		}
		sol['nQuestion'] = idxQuiz;
		sol['checked'] = bChecked;
		console.log(bChecked);
	}
}

// This function disables all anfahren buttons
function disableStart() {
	$("#btn_start").disable();
}

function invisibleStart() {
	$("#btn_start").invisible();
}

// This function is used to hide the first Task, the send button and input fields
function hideTask() {
	$("#exerciseTable1").invisible();
	$("#ex1-textbox").invisible();
	$("#btn_send").display();
	$('#btn_send').enable();
	$("#btn_quiz").displayNone();
	$("#btn_quiz").disable();
}

function showQuiz(idx){
	$("#ex1-textbox").invisible();
	$("#quiz-textbox").visible();
	$("#task1").invisible();
	$("#task1").displayNone();
	$("#task-quiz").visible();
	$("#task-quiz").display();
	$("#btn_send").visible();
	$("#btn_send").display();
	$("#btn_send").enable();
	$("#btn_start").disable();
	$("#btn_start").invisible();
	console.log("### showQuiz idx: " + idx)
	requestQuiz()
	if (idx==1) {
		setTimeout(() => {  console.log("Sleeping for 100ms"); }, 100);
		$("#btn_quiz").invisible();
		$("#btn_quiz").disable();
		// TODO: Send button disable +
		initQuiz();
	}
}

// TODO: löschen
function resetAnfahren() {
	let i = 0;
	console.log("Valid stack: " + valid)
	valid.forEach(element => {
		if (element == true ) {//&& $("#checkbox" + i).prop('checked')
			$("#anfahren" + i).visible();
			$("#anfahren" + i).enable();
		}
		i++;
	});
}


// request initialization stuff from server
function initCI() {
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab3/initCI/',
		dataType: 'json'
	}).done(function (data) {
		console.log('initCI()')
		let b_imesUser = data['b_imesUser'];
		if (b_imesUser == true){
			$("#btn_debug").visible();
			bDebugMode = data['bDebug']
			if (bDebugMode == true){
			document.getElementById("btn_debug").className = "btn btn-success pull-left btn-lg"
			} else {
			document.getElementById("btn_debug").className = "btn btn-default pull-left btn-lg"
			}
		}
	}).fail(function () {
		BootstrapDialog.alert(unescape('User-Status konnte nicht abgefragt werden.'))
	})
}

// request random values from server
function request_random_values() {
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab3/init/',
		dataType: 'json'
	}).done(function (data) {
		let i = 0;
		let exerciseTable = document.getElementById('exerciseTable');
		let q_start_deg = data['q_start_deg'];
		let delta_x_mm = data['delta_x_mm'];

		sText1 = "\\( \\boldsymbol{q}_\\text{0} = (" + q_start_deg[0] + ", " + q_start_deg[1] + ", "
				+ q_start_deg[2] + ", " + q_start_deg[3] + ", "
				+ q_start_deg[4] + ", " + q_start_deg[5] + ")^\\text{T} \\)";
		sText2 = "\\( \\Delta \\boldsymbol{r}_\\text{E} = (" + delta_x_mm[0] + ", " + delta_x_mm[1] + ", "
				+ delta_x_mm[2] + ")^\\text{T} \\)";
		$("#gegeben-ex1").html(sText1 + '<br>' + sText2);
		$("#q1_target").html("");
		$("#q2_target").html("");
		$("#q3_target").html("");
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, exerciseTable1]);
	}).fail(function () {
		BootstrapDialog.alert(unescape('Unbekannter Fehler. Werte konnten nicht abgefragt werden.'))
	})
}

// request Quiz file from Server
function requestQuiz() {
	if (idxQuiz > 5){
		$("#btn_send").invisible();
		$("#btn_send").disable();
		return;
	}
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab3/get_quiz/',
		dataType: 'json'
	}).done(function (data) {
		console.log('requestQuiz')
		// HIER der Code, sobald Quiz starten soll und erfolgreich initialisiert
		//console.log(data)
		let idx = idxQuiz;
		console.log("idxQuiz: " + idx)
		console.log(data[idx-1])
		for(let i=0; i<=4; i++) {
			document.getElementById("quiz-textbox").innerHTML = data[idx-1]['question'];
			$("#answer" + i).html(data[idx-1]['answers'][i]['answer']);
			//document.getElementById("quiz-checkbox" + i).checked = data[idx-4]['answers'][i]['truth'];  //debugging
			document.getElementById("quiz-checkbox" + i).checked = false;
		}
		//let quizTable = document.getElementById('quiz-table');
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('quiz-table')]);
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('quiz-textbox')]);
	}).fail(function () {
		BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
	})
}

// entering the quiz part: Server has to move the robot towards initial position
function initQuiz() {
	$.ajax({
		type: 'POST',
		url: mainroute + '/lab3/init_quiz/',
		dataType: 'json'
	}).done(function (data) {
		console.log('initQuiz')
	}).fail(function () {
		BootstrapDialog.alert(unescape('Initialisierung des Quiz: ' + data['resp']));
	})
}

$(document).ready(function () {
	initCI();
	request_random_values();
	//invisibleStart();

	// Download button was pushed
	$('#btn_download').click(function (event) {
		event.preventDefault()
		window.open(mainroute + "/lab3/download/" + (new Date()).valueOf())
	})
	// send button was pushed
	$('#btn_send').click(function (event) {
		event.preventDefault()
		var sol = {}
		setupInput(sol);
		var route_string = ''
		if (idxQuiz > 0){
		route_string = '_quiz';
		}
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab3/send' + route_string + '/',
			data: JSON.stringify(sol),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				if (idxQuiz == 0) {
					$("#btn_start").visible();
					$("#btn_start").enable();
					BootstrapDialog.alert(data['resp'])
					$('#btn_send').displayNone();
					$('#btn_send').disable();
					$("#btn_quiz").visible();
					$("#btn_quiz").enable();
					document.getElementById("ex1-textbox").innerHTML = "Sie können den Roboter nun die geplante Bahn abfahren lassen. Anschließend starten Sie bitte das Quiz. <br> &nbsp;";
					idxQuiz = 1;
					//resetAnfahren();
				} else {
						//hideTask();
						idxQuiz = idxQuiz+1;
						console.log("Antwort korrekt. Frage an Frage Nr.: " + idxQuiz)
						BootstrapDialog.alert(unescape(data['resp']));
						requestQuiz();
				}
			}
			else {
				BootstrapDialog.alert(data['resp'])
				if (idxQuiz == 0) {
					// request new positions from server
					request_random_values();
				}
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			console.log("failed to send data")
			// activate valid positions - remove later this part
			//valid = [true, true, true, true, true]; // FIXME: later remove
			//resetAnfahren();
		})

	})

	// debug button was clicked
	$('#btn_quiz').click(function (event) {
		event.preventDefault()
		showQuiz(1)
	})

	// debug button was clicked
	$('#btn_debug').click(function (event) {
		event.preventDefault()
		var rVal = {}
		if (bDebugMode){
			rVal['bDebug'] = false;
		} else {
			rVal['bDebug'] = true;
		}
		console.log("++++++ toggle debug")
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab3/toggle_debug/',
			data: JSON.stringify(rVal),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			console.log("++++++ toggle debug")
			bDebugMode = rVal['bDebug'];
			if (bDebugMode){
				document.getElementById("btn_debug").className = "btn btn-success pull-left btn-lg"
			} else {
				document.getElementById("btn_debug").className = "btn btn-default pull-left btn-lg"
			}

		}).fail(function () {
			BootstrapDialog.alert(unescape('Debug-Anfrage konnte nicht gesendet werden.'))
			console.log("failed to send data -> websocket")
		})
	})

	// start button was clicked
	$("#btn_start").click(function (event) {
		event.preventDefault()
		$("#btn_start").disable();
		sol = {};
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab3/start/',
			data: JSON.stringify(sol),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				console.log("Target Position wurde angefahren")
			}else{
				BootstrapDialog.alert(unescape(data['resp']))
			}
			$("#btn_start").enable();
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			$("#btn_start").enable();
		})
	});
});
