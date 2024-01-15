// We make use of this 'server' variable to provide the address of the
// REST Janus API. By default, in this example we assume that Janus is
// co-located with the web server hosting the HTML pages but listening
// on a different port (8088, the default for HTTP in Janus), which is
// why we make use of the 'window.location.hostname' base address. Since
// Janus can also do HTTPS, and considering we don't really want to make
// use of HTTP for Janus if your demos are served on HTTPS, we also rely
// on the 'window.location.protocol' prefix to build the variable, in
// particular to also change the port used to contact Janus (8088 for
// HTTP and 8089 for HTTPS, if enabled).
// In case you place Janus behind an Apache frontend (as we did on the
// online demos at http://janus.conf.meetecho.com) you can just use a
// relative path for the variable, e.g.:
//
// 		var server = "/janus";
//
// which will take care of this on its own.
//
//
// If you want to use the WebSockets frontend to Janus, instead, you'll
// have to pass a different kind of address, e.g.:
//
// 		var server = "ws://" + window.location.hostname + ":8188";
//
// Of course this assumes that support for WebSockets has been built in
// when compiling the server. WebSockets support has not been tested
// as much as the REST API, so handle with care!
//
//
// If you have multiple options available, and want to let the library
// autodetect the best way to contact your server (or pool of servers),
// you can also pass an array of servers, e.g., to provide alternative
// means of access (e.g., try WebSockets first and, if that fails, fall
// back to plain HTTP) or just have failover servers:
//
//		var server = [
//			"ws://" + window.location.hostname + ":8188",
//			"/janus"
//		];
//
// This will tell the library to try connecting to each of the servers
// in the presented order. The first working server will be used for
// the whole session.
//
var server= "/janus";

var janus = null;
var streaming = null;
var opaqueId = "streamingtest-"+Janus.randomString(12);
var started = false;
var spinner = null;

var selectedStream = null;

var remind =0;

var stream_id=2;

var bitrateTimer = null;

var simulcastStarted = false, svcStarted = false;


function start_vid(stream_id) {
	// Initialize the library (all console debuggers enabled)
	Janus.init({debug: "all", callback: function() {
		// Make sure the browser supports WebRTC
		if(!Janus.isWebrtcSupported()) {
			bootbox.alert("No WebRTC support... ");
			return;
		}
		// Create session
		janus = new Janus(
			{
				server: server,
				iceServers : [{url: "stun:stun.l.google.com:19302"}],
				//{url: "stun:relab.imes.uni-hannover.de:5349?transport=udp"}],
				success: function() {
					// Attach to Streaming plugin
					janus.attach(
						{
							plugin: "janus.plugin.streaming",
							opaqueId: opaqueId,
							success: function(pluginHandle) {
								streaming = pluginHandle;
								var body = { "request": "watch", id: stream_id };
								streaming.send({"message": body});
							},
							error: function(error) {
								Janus.error("  -- Error attaching plugin... ", error);
								bootbox.alert("Error attaching plugin... " + error + ".\n Der Videostream steht leider derzeit nicht zur Verfügung. Der Versuchsstand ist trotzdem betriebsbereit.");
							},
							onmessage: function(msg, jsep) {
								Janus.debug(" ::: Got a message :::");
								Janus.debug(msg);
								console.log(" ::: Got a message :::")
								console.log(msg)
								var result = msg["result"];
								if(result !== null && result !== undefined) {
									if(result["status"] !== undefined && result["status"] !== null) {
										var status = result["status"];
										if(status === 'starting')
										$('#status').removeClass('hide').text("Starting, please wait...").show();
										else if(status === 'started')
										$('#status').removeClass('hide').text("Started").show();
										else if(status === 'stopped')
										stopStream();
									} else if(msg["streaming"] === "event") {
										// Is simulcast in place?
										var substream = result["substream"];
										var temporal = result["temporal"];
										if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
											if(!simulcastStarted) {
												simulcastStarted = true;
												addSimulcastButtons(temporal !== null && temporal !== undefined);
											}
											// We just received notice that there's been a switch, update the buttons
											updateSimulcastButtons(substream, temporal);
										}
										// Is VP9/SVC in place?
										var spatial = result["spatial_layer"];
										temporal = result["temporal_layer"];
										if((spatial !== null && spatial !== undefined) || (temporal !== null && temporal !== undefined)) {
											if(!svcStarted) {
												svcStarted = true;
												addSvcButtons();
											}
											// We just received notice that there's been a switch, update the buttons
											updateSvcButtons(spatial, temporal);
										}
									}
								} else if(msg["error"] !== undefined && msg["error"] !== null) {
									bootbox.alert(msg["error"]);
									stopStream();
									return;
								}
								if(jsep !== undefined && jsep !== null) {
									Janus.debug("Handling SDP as well...");
									Janus.debug(jsep);
									var stereo = (jsep.sdp.indexOf("stereo=1") !== -1);
									// Offer from the plugin, let's answer
									streaming.createAnswer(
										{
											jsep: jsep,
											// We want recvonly audio/video and, if negotiated, datachannels
											media: { audioSend: false, videoSend: false, data: true },
											customizeSdp: function(jsep) {
												if(stereo && jsep.sdp.indexOf("stereo=1") == -1) {
													// Make sure that our offer contains stereo too
													jsep.sdp = jsep.sdp.replace("useinbandfec=1", "useinbandfec=1;stereo=1");
												}
											},
											success: function(jsep) {
												Janus.debug("Got SDP!");
												Janus.debug(jsep);
												var body = { "request": "start" };
												streaming.send({"message": body, "jsep": jsep});
												//$('#watch').html("Stop").removeAttr('disabled').click(stopStream);
											},
											error: function(error) {
												Janus.error("WebRTC error:", error);
												bootbox.alert("WebRTC error... " + JSON.stringify(error));
											}
										});
									}
								},
							onremotestream: function(stream) {
								//await Sleep(3000); // Für Chrome-Support 1 Sekunde warten
								Janus.debug(" ::: Got a remote stream :::");
								$('#update-streams').unbind('click').addClass('fa-spin');
								var body = { "request": "list" };
								Janus.debug("Sending message (" + JSON.stringify(body) + ")");
								console.log("Sending message (" + JSON.stringify(body) + ")");
								streaming.send({"message": body, success: function(result) {
									setTimeout(function() {
										a=2;
									}, 500);
									if(result === null || result === undefined) {
										bootbox.alert("Got no response to our query for available streams");
										return;
									}
									if(result["list"] !== undefined && result["list"] !== null) {
										var list = result["list"];
										Janus.log("Got a list of available streams");
										if(list && Array.isArray(list)) {
											list.sort(function(a, b) {
												if(!a || a.id < (b ? b.id : 0))
												return -1;
												if(!b || b.id < (a ? a.id : 0))
												return 1;
												return 0;
											});
										}
										Janus.debug(list);
										for(var mp in list) {
											Janus.debug("  >> [" + list[mp]["id"] + "] " + list[mp]["description"] + " (" + list[mp]["type"] + ")");
											$('#streamslist').append("<li><a href='#' id='" + list[mp]["id"] + "'>" + list[mp]["description"] + " (" + list[mp]["type"] + ")" + "</a></li>");
										}
									}
								}});
								Janus.debug(JSON.stringify(stream));
								if($('#remotevideo').length === 0)
								$('#stream').append('<video class="rounded centered hide" id="remotevideo" width="100%" autoplay/>');
								$('#vid_message').html('');
								console.log("##### Z205")
								// Show the stream and hide the spinner when we get a playing event
								$("#remotevideo").bind("playing", function () {
									console.log("#####  playing event")
									$('#waitingvideo').remove();
									$('#remotevideo').removeClass('hide');
									//startCrossHair();
									//if(adapter.browserDetails.browser=='firefox'){
									//	remind++;
									//	if(spinner !== null && spinner !== undefined && remind==2){
									//		spinner.stop();
									//		spinner = null;
									//		remind=0}
									//} else {
									//	if(spinner !== null && spinner !== undefined){
									//		spinner.stop();}
									//	spinner = null;
									//}
								});
								// ****** test
								$('#waitingvideo').remove();
								$('#remotevideo').removeClass('hide');
								// ******
								Janus.attachMediaStream($('#remotevideo').get(0), stream);
							},
							oncleanup: function() {
								Janus.log(" ::: Got a cleanup notification :::");
								console.log(" ::: Got a cleanup notification :::");
								$('#waitingvideo').remove();
								$('#remotevideo').remove();
								//stopCrossHair();
							},
							ondataopen: function(data) {
								Janus.log("The DataChannel is available!");
								$('#waitingvideo').remove();
								$('#stream').append(
									'<input class="form-control" type="text" id="datarecv" disabled></input>'
								);
								if(spinner !== null && spinner !== undefined)
								spinner.stop();
								spinner = null;
							},
							ondata: function(data) {
								Janus.debug("We got data from the DataChannel! " + data);
								$('#datarecv').val(data);
							}
							});
						},
						error: function(error) {
							Janus.error(error);
							bootbox.alert("WebRTC error... " + error + ".\n Der Videostream steht leider derzeit nicht zur Verfügung. Der Versuchsstand ist trotzdem betriebsbereit.");
							//bootbox.alert(error, function() {
							//	window.location.reload();
							//});
						},
						destroyed: function() {
							//window.location.reload();
						}
					});
	}});
}
function stopStream() {
	console.log("##### stopStream()")
	var body = { "request": "stop" };
	streaming.send({"message": body});
	streaming.hangup();
}

$(document).ready(function() {
	console.log('ready fcn')
	start_vid(stream_id);
	console.log('stream started')
	//$('#remotevideo').removeClass('hide');

	// Chrome-Browser fix: ohne diesen Abschnitt startet video nicht von allein
	// setTimeout(function(){
	// 	console.log('#### delayed: ')
	// 	streaming.send({"message": { "request": "pause"}});
	// 	setTimeout(function(){
	// 		streaming.send({"message": { "request": "start"}});
	// 	}, 5000);
	// }, 7000);
	setTimeout(function(){
		console.log('#### delayed: ')
		vid = document.getElementById("remotevideo");
		setTimeout(function(){
			vid.setAttribute("controls", "controls");		// "Alle Steuerelemente anzeigen"
		}, 200);
		vid.play();		// Chrome: funktioniert nicht aufgrund autoplay policity (erst Nutzerinteraktion notwendig)
	}, 2000);

});
