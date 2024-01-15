$(document).ready(function(){
	$.ajax({         
			type: 'GET',         
			url: '/RobotikII/rest/view/ranking/',        
			//data: form_data,        
			contentType: false,       
			processData: false,
			dataType: 'json'
		}).done(function(data, textStatus, jqXHR){
			if ($('#pic_cont').height()-40<20) {
				$('#table_cont').height(400);
			} else {
				$('#table_cont').height($('#pic_cont').height()-20);
			}
		
	$('#table_cont').css({top: 0, position: "relative"});
			for (i=0; i< data['positions'].length; i++) {
				if (i+1==data['own_pos']){
					var row = '<tr class="Info" style="background-color: #5bc0de">';
				}
				else {
					var row = '<tr>';
				}
				row = row + '<td>'+ data['positions'][i] +'</td>';
				row = row + '<td>'+ data['scores'][i][1].toString() +'</td>';
				if (data['scores'][i][0]==null){row = row + '<td></td>';}
				else {row = row + '<td>'+ data['scores'][i][0].toString() +'</td>';}
				row = row + '</tr>';
				$('#ranking > tbody:last').append(row);			
			}
		//$('#table_cont').height($('#pic_cont').height()-40);
		//$('#table_cont').height(Math.max($('#pic_cont').height()-40,400));
		
	//$('#table_cont').css({top: 20, position: "relative"});
		}).fail(function(data){     
		});
});

$(function() {
	$('#cal').click(function(event) {  
		event.preventDefault();
    		window.location = "/BI/"
	});
	$('#labor').click(function(event) {  
		event.preventDefault();
    		window.location = "/CI/"
	});
	$('#booking').click(function(event) {  
		event.preventDefault();
    		window.location = "/SI/"
	});
	$('#help').click(function(event) {  
		event.preventDefault();
    		window.location = "/help/relab.html"
	});
	$('#help_cal').click(function(event) {  
		event.preventDefault();
    		window.location = "/help/booking.html"
	});
	$('#help_exercise1').click(function(event) {  
		event.preventDefault();
    		window.location = "/help/exercise1.html"
	});
})
