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
// when compiling the gateway. WebSockets support has not been tested
// as much as the REST API, so handle with care!
//
//
// If you have multiple options available, and want to let the library
// autodetect the best way to contact your gateway (or pool of gateways),
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
//var server = "/wsbend";
//var server = [
//			"wss://" + window.location.hostname + ":8188",
//			"/video"
//		];
//if(window.location.protocol === 'http:')
//	server = "/janus";
//else
//	server = "https://" + window.location.hostname + ":8089/janus";
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var zaehler = 0;
var server= "/janus";

var janus = null;
var streaming = null;
var opaqueId = "streamingtest-" + Janus.randomString(12);
var started = false;
var spinner = null;

var selectedStream = null;

var remind = 0;

var stream_id = 6;

function start_vid(stream_id) {
	Janus.init({
		debug: "all", callback: function () {
			// Use a button to start the demo
			if (started)
				return;
			started = true;
			$(this).attr('disabled', true).unbind('click');
			// Make sure the browser supports WebRTC
			if (!Janus.isWebrtcSupported()) {
				bootbox.alert("No WebRTC support... ");
				return;
			}
			// Create session
			janus = new Janus(
				{
					server: server,
					ipv6: true,
					//iceServers: [{ url: 'stun:SERVER_IP:5349?transport=udp', credential: 'PASSWORD', username: 'relabUser' },
					//{ url: 'turn:SERVER_IP:5349?transport=udp', credential: 'PASSWORD', username: 'relabUser' },],
					success: function () {
						// Attach to streaming plugin
						janus.attach(
							{
								plugin: "janus.plugin.streaming",
								opaqueId: opaqueId,
								success: function (pluginHandle) {
									streaming = pluginHandle;
									var body = { "request": "watch", id: stream_id };
									streaming.send({ "message": body });
								},
								error: function (error) {
									Janus.error("  -- Error attaching plugin... ", error);
									bootbox.alert("Error attaching plugin... " + error);
								},
								onmessage: function (msg, jsep) {
									Janus.debug(" ::: Got a message :::");
									Janus.debug(JSON.stringify(msg));
									var result = msg["result"];
									if (result !== null && result !== undefined) {
										if (result["status"] !== undefined && result["status"] !== null) {
											var status = result["status"];
											if (status === 'starting')
												$('#status').removeClass('hide').text("Starting, please wait...").show();
											else if (status === 'started')
												$('#status').removeClass('hide').text("Started").show();
											else if (status === 'stopped')
												stopStream();
										}
									} else if (msg["error"] !== undefined && msg["error"] !== null) {
										bootbox.alert(msg["error"]);
										stopStream();
										return;
									}
									if (jsep !== undefined && jsep !== null) {
										Janus.debug("Handling SDP as well...");
										Janus.debug(jsep);
										// Answer
										streaming.createAnswer(
											{
												jsep: jsep,
												media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
												success: function (jsep) {
													Janus.debug("Got SDP!");
													Janus.debug(jsep);
													var body = { "request": "start" };
													streaming.send({ "message": body, "jsep": jsep });
												},
												error: function (error) {
													Janus.error(error);
						bootbox.alert("WebRTC error... " + error + ".\n Der Videostream steht leider derzeit nicht zur Verfügung. Der Versuchsstand ist trotzdem betriebsbereit.");
												}
											});
									}
								},
								onremotestream: function (stream) {
									Janus.debug(" ::: Got a remote stream :::");
									Janus.debug(JSON.stringify(stream));
									if ($('#remotevideo').length === 0)
										$('#stream').append('<video class="rounded centered hide" id="remotevideo" width="100%" autoplay/>');
									$('#vid_message').html('');
									// Show the stream and hide the spinner when we get a playing event
									$("#remotevideo").bind("playing", function () {
										$('#waitingvideo').remove();
										$('#remotevideo').removeClass('hide');
									});
									Janus.attachMediaStream($('#remotevideo').get(0), stream);
								},
								oncleanup: function () {
									Janus.log(" ::: Got a cleanup notification :::");
									$('#waitingvideo').remove();
									$('#remotevideo').remove();
								}
							});
					},
					error: function (error) {
						Janus.error(error);
						bootbox.alert("WebRTC error... " + error + ".\n Der Videostream steht leider derzeit nicht zur Verfügung. Der Versuchsstand ist trotzdem betriebsbereit.");
					},
					destroyed: function () {
						window.location.reload();
					}
				});
		}
	});
}


$(document).ready(function () {
	start_vid(stream_id);
});
