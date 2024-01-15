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
    return this.prop("disabled",true);
};

jQuery.fn.enable = function() {
    return this.prop("disabled",false);
};


// NOT USED
// Get possible positions from Server (Replace later with code above) 
//var position; // Array that contains different positions
// var valid; // array that contains the answers for the checkboxes NOT USED



var idxTask = 1; // counter representing the current task of lab1
var bDebugMode = false;

// helper function: Check if input is complete
function setupInput(sol) {
	// write input in solutions
	if (idxTask<4){
		let Tmat = [];
		for (let i = 0; i < 4; i++) {
		let tmp = [];
		for (let j = 0; j < 4; j++) {
			// save the input
			let T_ = parseFloat($('#T' + idxTask + '_' + i + j).val());
			tmp.push(T_);
		}
		Tmat.push(tmp)
		}
		console.log(Tmat)
		sol['Tmat'] = Tmat;
	} else {
		let bChecked = [];
		for (let j = 0; j < 5; j++) {
			// save the input
			bChecked.push(document.getElementById("checkbox" + j).checked);
		}
		sol['nQuestion'] = idxTask - 3;
		sol['checked'] = bChecked;		
		console.log(bChecked);
		
	}
}


// This function is used to hide Task 1a, the send button and input fields 
function hideTask(idx) {
	$("#exerciseTable" + idx).invisible();
	//$("#ex1-text").invisible();
	$("#sendWrapper").displayNone();
	$("#startWrapper").display();
}

function updateQuiz(idx) {
	for(let i=1; i<=5; i++) {
		$("#answer" + i).html("Testantwort " + i);
	}
}
function showTask(idx){
	$("#ex" + (idx-1) + "-text").invisible();
	$("#ex" + idx + "-text").visible();
	$("#task" + (idx-1)).invisible();
	$("#task" + (idx-1)).displayNone();
	$("#task" + idx).visible();
	$("#task" + idx).display();
	$("#startWrapper").displayNone();
	$("#sendWrapper").display();
	console.log("### showTask idx: " + idx)
	if (idx<4) {
		fillTmat(idx)
	}
	if (idx>3) {
		requestQuiz()
		if (idx==4) {
			setTimeout(() => {  console.log("Sleeping for 100ms"); }, 100);
			initQuiz();
		}
	}
}

function fillTmat(idx){
	for(let i=0; i < 4; i++){
		for(let j=0; j < 4; j++){
			$("#T" +idx + "_" + i + j).html("");
			//if (bDebugMode){
			//	document.getElementById("T" +idx + "_" + i + j).setAttribute("value",i*4+j+1)		// debugging reason..
			//} 
		}
	}
}

// request Quiz file from Server
function requestQuiz() {
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab1/get_quiz/',
		dataType: 'json'
	}).done(function (data) {
		console.log('requestQuiz')
		//console.log(data)
		let idx = idxTask;
		for(let i=0; i<=4; i++) {
			document.getElementById("ex" +4+ "-textbox").innerHTML = data[idx-4]['question'];
			//$("#answer" + i).html('test')
			$("#answer" + i).html(data[idx-4]['answers'][i]['answer']);
			//document.getElementById("checkbox" + i).checked = data[idx-4]['answers'][i]['truth'];  //debugging
			document.getElementById("checkbox" + i).checked = false;
		}
		let exerciseTable4 = document.getElementById('exerciseTable4');
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, exerciseTable4]);	
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('ex4-textbox')]);
	}).fail(function () {
		BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
	})
}

function initQuiz() {
	$.ajax({
		type: 'POST',
		url: mainroute + '/lab1/init_quiz/',
		dataType: 'json'
	}).done(function (data) {
		console.log('initQuiz')
	}).fail(function () {
		BootstrapDialog.alert(unescape('Initialisierung des Quiz: ' + data['resp']));
	})
}

function waitForWebsocketConn(){
	while (bWebsocket_connected==false){
		//console.log("waiting for websocket..");
		setTimeout(() => {  console.log("waiting for websocket.."); }, 1000);
	}
}

// request initialization stuff from server
function initCI() {
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab1/initCI/',
		dataType: 'json'
	}).done(function (data) {
		console.log('initCI()')
		let b_imesUser = data['b_imesUser'];
		if (b_imesUser == true){
			$("#btn_debug").visible();
			document.getElementById("btn_debug").className = "btn btn-default pull-left btn-lg"
		}	
	}).fail(function () {
		BootstrapDialog.alert(unescape('User-Status konnte nicht abgefragt werden.'))
	})
}


// request transformation (euler + translation) from server
function requestPositions() {
	$.ajax({
		type: 'GET',
		url: mainroute + '/lab1/init/',
		dataType: 'json'
	}).done(function (data) {
		// load kordinates 
		//let euler = [90,0,-90]; // Test
		//let transl = [20.1, 43.3, 55.7]; // Test
		console.log('requestPosition')
		
		// Task A
		//let euler = data['a_rot'];
		//let transl = data['a_transl'];
		let euler_OE = data['a_eul_OE'];
		let transl_OE = data['a_r_OE'];
		let euler_OB = data['a_eul_OB'];
		let transl_OB = data['a_r_OB'];
		sText1 = "\\( _\\text{(0)}(\\gamma, \\alpha, \\gamma')^\\text{T}_\\text{E} = (" + euler_OE[0] + ", "  + euler_OE[1] + ", "  + euler_OE[2]+ ")^\\text{T} \\)";
		sText2 = '\\( {_{\\mathrm{(0)}}r_{\\mathrm{E}}} = (' + transl_OE[0] + ', '  + transl_OE[1] + ', '  + transl_OE[2]+ ')^\\text{T} \\)';
		sText3 = "\\( _\\text{(0)}(\\gamma, \\alpha, \\gamma')^\\text{T}_\\text{B} = (" + euler_OB[0] + ", "  + euler_OB[1] + ", "  + euler_OB[2]+ ")^\\text{T} \\)";
		sText4 = '\\( {_{\\mathrm{(0)}}r_{\\mathrm{B}}} = (' + transl_OB[0] + ', '  + transl_OB[1] + ', '  + transl_OB[2]+ ')^\\text{T} \\)';
		$("#gegeben-ex1").html(sText1 + '<br>' + sText2 + '<br>' + sText3 + '<br>' + sText4);
		
		//Task B
		let quat_Z = data['b_quat_A'];
		let Or_Z = data['b_Or_A'];
		let Or_S = data['b_Or_B'];
		let eul_S = data['b_eulxyz_B'];
		sText1 = '\\( _\\text{(0)}\\boldsymbol{q}_\\text{A} = (' + quat_Z[0] + ', '  + quat_Z[1] + ', '  + quat_Z[2] + ', '  + quat_Z[3]+ ')^\\text{T} \\)';
		//sText1 = '\\( _\\text{(0)}\\boldsymbol{q}_\\text{A} = (' + quat_Z[0] + ', '  + quat_Z[1] + ', \\) <br> \\('  + quat_Z[2] + ', '  + quat_Z[3]+ ')^\\text{T} \\)';
		sText2 = '\\( _\\text{(0)}\\boldsymbol{r}_\\text{A} = (' + Or_Z[0] + ', '  + Or_Z[1] + ', '  + Or_Z[2]+ ')^\\text{T} \\)';
		sText3= '\\( _\\text{(0)}\\boldsymbol{r}_\\text{B} = (' + Or_S[0] + ', '  + Or_S[1] + ', '  + Or_S[2]+ ')^\\text{T} \\)';
		sText4= '\\( _\\text{(0)}(\\alpha, \\beta, \\gamma)^\\text{T}_\\text{B}  = (' + eul_S[0] + ', '  + eul_S[1] + ', '  + eul_S[2]+ ')^\\text{T} \\)';
		$("#gegeben-ex2").html(sText1 + '<br>' + sText2 + '<br>' + sText3 + '<br>' + sText4);
		
		// Task C
		let Or_S_neu = data['c_Ar_B'];
		let theta_S_neu = data['c_theta_AB'];
		let u_S_neu = data['c_u_AB'];
		sText1 = '\\( _\\text{(A)}\\boldsymbol{r}_\\text{B} = (' + Or_S_neu[0] + ', '  + Or_S_neu[1] + ', ' + '<br>' + Or_S_neu[2]+ ')^\\text{T} \\)';
		sText2 = '\\( _\\text{(A)}\\theta_\\text{B} = ' + theta_S_neu[0] + ' \\)';
		sText3 = '\\( _\\text{(A)}\\boldsymbol{u}_\\text{B} = (' + u_S_neu[0] + ', '  + u_S_neu[1] + ', '  + u_S_neu[2]+ ')^\\text{T} \\)';
		$("#gegeben-ex3").html(sText1 + '<br>' + sText2 + '<br>' + sText3);
		
		//$("#translation").html(sText2)
		// empty input fields
		fillTmat(1);
		let exerciseTable1 = document.getElementById('exerciseTable1');
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, exerciseTable1]);
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('exerciseTable2')]);
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('exerciseTable3')]);
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('ex4-textbox')]);
		
		// if user reconnect to session: jump to last task
		if (data['goto']>0){
			//waitForWebsocketConn();
			setTimeout(() => {  console.log("waiting for websocket.."); }, 5000);
			for(let idx=1; idx < data['goto']; idx++){
				idxTask = idx;
				console.log("goto: idxTask = " + idxTask)
				if (idxTask<4){				
					hideTask(idxTask);
					document.getElementById("ex" +idxTask+ "-textbox").innerHTML = 'Übersprungen';
					setTimeout(() => {  console.log("Sleeping for 100ms"); }, 100);
					showTask(idxTask +1);
				} else {
					idxTask = idx+1;
					if (idxTask>8){
						BootstrapDialog.alert(unescape('Fehler bei der Wiederherstellung der aktuellen Sitzung aufgetreten!'));
					}
					requestQuiz();		
				}
			}
		}
	}).fail(function () {
		BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
	})
}

$(document).ready(function () {
	initCI();
	requestPositions();
	$('#btn_download').click(function (event) {
		event.preventDefault()
		window.open(mainroute + "/lab1/download/" + (new Date()).valueOf())
	})

	// Send button was pushed
	$('#btn_send').click(function (event) {
		event.preventDefault()
		var sol = {}
		setupInput(sol);
		var route_string = String.fromCharCode(96+idxTask);
		if (idxTask > 3){
		route_string = 'quiz';		
		}
		console.log("++++++ route_string = " + route_string)
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab1/send_1' + route_string + '/',
			data: JSON.stringify(sol),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				if (idxTask<4){				
					hideTask(idxTask);
					//showTask2();
					//BootstrapDialog.alert(data['resp'])
					document.getElementById("ex" +idxTask+ "-textbox").innerHTML = data['resp'];
					/*showTask(idxTask +1);
					idxTask = idxTask+1;
					console.log("~~~~ idxTask = " + idxTask)*/
				} else {
					idxTask = idxTask+1;
					BootstrapDialog.alert(unescape(data['resp']));
					//if (idxTask>8){
					//	BootstrapDialog.alert(unescape(data['resp']));
					//}
					requestQuiz();		
				}
			}
			else {
				BootstrapDialog.alert(unescape(data['resp']));
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			console.log("failed to send data -> websocket")
			//hideTask(idxTask);
			//showTask2();
		})
	})
	
	// start button was clicked
	$('#btn_start').click(function (event) {
		event.preventDefault()
		var sol = {}
		//setupInput(sol);
		var route_string = String.fromCharCode(96+idxTask);
		console.log("++++++ route_string = " + route_string)
		$.ajax({
			type: 'POST',
			url: mainroute + '/lab1/start_1' + route_string + '/',
			data: JSON.stringify(sol),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			if (data['success'] == true) {
				showTask(idxTask +1);
				idxTask = idxTask+1;
				console.log("~~~~ idxTask = " + idxTask)
				BootstrapDialog.alert(data['resp'])
			}
			else {
				BootstrapDialog.alert(unescape(' ' + data['resp']));
			}
		}).fail(function () {
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			console.log("failed to send data -> websocket")
			//showTask(idxTask +1);
		})
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
			url: mainroute + '/lab1/toggle_debug/',
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
			BootstrapDialog.alert(unescape('Es ist ein unbekannter Fehler aufgetreten.'))
			console.log("failed to send data -> websocket")
		})
	})
});
