var scheduled;
var timeScheduled;
var amountOfBlocks = 0;

var isAuthenticated = true;

var PRODUCTION = false;

var modelBlocks = [];
var shownBlocks = [];
var idBlocks = {};

var imgMode = {};

var username = '';

var bank = {};

var hasCallbackBeenSet = {};

//TODO: VERY TEMPORARY
var lastBody = '';

var socket = io();

let audio = new Audio('https://notificationsounds.com/notification-sounds/intuition-561/download/mp3');


socket.on('auth', function(){
	console.log('got auth request, sending cookie');
	socket.emit('authresponse', $.cookie('session'));
})

socket.on('authenticated', function(msg){
	console.log('authenticated, now can start running code blocks');
	isAuthenticated = true;
	console.log(msg.username);
	username = msg.username;
	updateBlocks();
	
})

socket.on('disconnected', function(){
	isAuthenticated = false;
})

var consistent = false;

$(document).ready(function(){
	
	var inHTTP = new XMLHttpRequest();
	
	inHTTP.onreadystatechange = function(){
		if (inHTTP.readyState == 4 && inHTTP.status == 200) {
			var response = JSON.parse(inHTTP.responseText);
			var subs = response.subscriptions.join(' ');
			
			$('.in').val(subs);
	
		}
	}
	
	inHTTP.open('GET', '/getsubs?session=' + $.cookie('session'), true);
	inHTTP.send();
	
	$('.in').on('keyup', function(){
		if(!scheduled || (new Date().getMilliseconds()-timeScheduled < 500)){
			clearTimeout();
			setTimeout(function(){
				scheduled = false;
				updateBlocks();
			}, 2500);
			scheduled = true;
		}
	})

	$('.in').change(updateBlocks);
	$('.in').blur(updateBlocks);
	$('.in').focus(updateBlocks);
	
	
});

function updateBlocks(){
	if(isAuthenticated){
		console.log('checked');
	
		var text = $('.in').val();
	
		var parts = [];
		
		var rParts = text.split(' ');
		
		for(var i = 0; i < rParts.length; i++){
			var cont = true;
			
			if(rParts[i][0]){
				if(rParts[i][0] != '/'){
					cont = false;
				}
			}else{
				cont = false;
			}
			
			if(cont){
				parts[parts.length] = rParts[i];
			}
		}
		
		for(var i = 0; i < parts.length; i++){
			if(!hasCallbackBeenSet[parts[i]]){
				socket.on(parts[i], function(msg){
					
					var rIntent = msg.intent;
					var body = msg.body;
					var nom = msg.name;
					var tim = msg.time;
					var typ = msg.type;
			
					var intentParts = rIntent.split('');
					intentParts.shift();
			
					var intent = intentParts.join('');
					
					var chatWindow = $('#chat' + intent);
					
					var Top = chatWindow.scrollTop();
					var Height = document.getElementById('chat'+intent).scrollHeight;
					
					if(typ != 'image'){
						if(nom != username){
							chatWindow.append('<div title="' + (tim || 'message sent before timestamp feature added') + '" class="message"><div class="name">' + nom + '</div><div class="message-text">' + body + '</div></div>');
						}else{
							chatWindow.append('<div title="' + (tim || 'message sent before timestamp feature added') + '" class="message mine"><div class="name">' + nom + '</div><div class="message-text mine">' + body + '</div></div>');
						}
					}else{
						if(nom != username){
							chatWindow.append('<div title="' + (tim || 'message sent before timestamp feature added') + '" class="message"><div class="name">' + nom + '</div><img src="' + body + '" class="message-image"/></div>');
						}else{
							chatWindow.append('<div title="' + (tim || 'message sent before timestamp feature added') + '" class="message mine"><div class="name">' + nom + '</div><img src="' + body + '" class="message-image mine"/></div></div>');
						}
					}

					if(Height - Top > 540)
						chatWindow.scrollTop(document.getElementById('chat'+intent).scrollHeight);
					
					if(!$(`#type${intent}`).is(':focus')){
						$(`#a${intent}`).addClass('new');
						audio.play();
						document.title = '*TapNoble*';
						// $(box.children()[0]).attr('style', 'color:white;');
					}
				})
				hasCallbackBeenSet[parts[i]] = true;
			}
		}
	
		var xhttp = new XMLHttpRequest();
		
		xhttp.open("POST", "/subscribe", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({session: $.cookie('session'), phrases: parts.join(',')}));

		// xhttp.open("GET", "/subscribe?session=" + $.cookie('session') + "&phrases=" + parts.join(','), true);
		// xhttp.send();
		
		var dashes = $('.dash');
		
		var partsLength = parts.length;
		var dashesLength = dashes.length;
		
		if(dashesLength < partsLength){
			for(var i = dashesLength; i < partsLength; i++){
				$('.body').append('<div id="dash' + i + '" 0="" auto;="" width:="" class="dash dashboard display-animation"></div>');
			}
		}
		
		if(dashesLength > partsLength){
			for(var i = partsLength; i < dashesLength; i++){
				$('#dash' + i).remove();
			}
		}
		
		for(var i = 0; i < partsLength; i++){
			
			var thePart = parts[i].split("");
			thePart.shift();
			thePart = thePart.join('');
			
			if(!($('#dash' + i).children().attr('id') == "a" + thePart)){
				(function(){
					console.log("element at $('#dash" + i + "') does not have an id of 'a" + thePart + "', but instead of " + $('#dash' + i).children().attr('id'));
				
					//TODO: just use thePart
					var nomen = parts[i].split('');
					nomen.shift();
					nomen = nomen.join('');
				
					bank[nomen] = i;
				
					var xhttp = new XMLHttpRequest();
				
					var records = '';
				
					xhttp.onreadystatechange = function() {
				    if (xhttp.readyState == 4 && xhttp.status == 200) {
							var response = JSON.parse(xhttp.responseText);
							if(!response.err && response.records){
						  	var recordLength = response.records.length;
							
								for(var j = 0; j < recordLength; j++){
									
									if(response.records[j].type != 'image'){
										if(response.records[j].name != username){
											records += '<div title="' + (response.records[j].time || 'message sent before timestamp feature added') + '" class="message"><div class="name">' + response.records[j].name + '</div><div class="message-text">' + response.records[j].body + '</div></div>';
										}else{
											records += '<div title="' + (response.records[j].time || 'message sent before timestamp feature added') + '" class="message mine"><div class="name">' + response.records[j].name + '</div><div class="message-text mine">' + response.records[j].body + '</div></div>';
										}
									}else{
										if(response.records[j].name != username){
											records += '<div title="' + (response.records[j].time || 'message sent before timestamp feature added') + '" class="message"><div class="name">' + response.records[j].name + '</div><img src="' + response.records[j].body + '" class="message-image"/></div>';
										}else{
											records += '<div title="' + (response.records[j].time || 'message sent before timestamp feature added') + '" class="message mine"><div class="name">' + response.records[j].name + '</div><img src="' + response.records[j].body + '" class="message-image mine"/></div>';
										}
									}
									
								}
							}
						
							var currentNomen = response.name;
						
							$('#dash' + bank[currentNomen]).html(`
							<a id="a${currentNomen}" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected ">
								<span class="content-wrapper">
									<span class="tile-content rap">
										<div class="nameheader">${currentNomen}</div>
										<div id="chat${currentNomen}" class="chat-container">${records}</div>
										<div class="orange-wrap">
											<input id="type${currentNomen}" class="type-message">
											<button id="send${nomen}">send</button>
										</div>
									</span>
								</span>
								<span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate">
								</span>
							</a>`);

							$(`#chat${currentNomen}`).scrollTop(document.getElementById(`chat${currentNomen}`).scrollHeight);
							
							$('.type-message').focus(function(){
								$(`#a${currentNomen}`).removeClass('new');
								document.title = 'TapNoble';
								// $(box.children().children().children()[0]).attr('style', 'color:#111111;');
							})
							
							$('.imgmode').click(function(){
								var id = $($(this).parent().parent().parent().parent().parent()).attr('id');
								var int = id.substring(1, id.length);
								console.log(int)
								imgMode[int] = !imgMode[int];
								$(this).html('img mode ' + imgMode[int]);
							})
							
							$('#send'+currentNomen).click(function(){
								var id = this.id;
			
								var rIntent = id.split('send')[1];
			
								var intent =  '/' + rIntent;
								var body = $('#type'+rIntent).val();
			
								var date = new Date();
	
								
								socket.emit('chat', {
									intent:intent,
									body:body,
									time: (date.getMonth()+1) + '/' + (date.getDate()) + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
									type: imgMode[currentNomen] ? 'image' : null
								})
			
								$($(this).parent().children()[0]).val('');
							})
							
							$('#type'+currentNomen).keypress(function(e){
								if(e.keyCode == 13){
									
									var id = this.id;
									var rIntent = id.split('type')[1];
									var intent = '/' + rIntent;
									var body = $(this).val();
									var date = new Date();
									
									socket.emit('chat', {
										intent:intent,
										body:body,
										time: (date.getMonth()+1) + '/' + (date.getDate()) + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
										type: imgMode[currentNomen] ? 'image' : null
									})
									
									$(this).val('');
								}
							})
						}
						
						
					};
					
					xhttp.open("GET", "/r" + parts[i], true);
					xhttp.send();
				})();
			}
			
		}
		
	}
}

function Block(nomen){
	return {
		id:'#send'+nomen,
		nomen:nomen,
		src: '<a id="0" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected "><span class="content-wrapper"><span class="tile-content rap"><div class="nameheader">'+nomen+'</div><div id="chat' + nomen + '" class="chat-container"></div><div class="orange-wrap"><input id="type' + nomen + '" class="type-message"><button id="send' + nomen + '">send</button></div></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>'
	};
}