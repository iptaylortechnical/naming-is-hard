var scheduled;
var timeScheduled;
var amountOfBlocks = 0;

var isAuthenticated = true;

var PRODUCTION = true;

var modelBlocks = [];
var shownBlocks = [];
var idBlocks = {};

var username = '';

var bank = {};

var hasCallbackBeenSet = {};

//TODO: VERY TEMPORARY
var lastBody = '';

var socket = io();


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
		
		console.log('parts: ' + parts);
		
		for(var i = 0; i < parts.length; i++){
			if(!hasCallbackBeenSet[parts[i]]){
				socket.on(parts[i], function(msg){
					console.log(msg);
					var rIntent = msg.intent;
					var body = msg.body;
					var nom = msg.name;
			
					var intentParts = rIntent.split('');
					intentParts.shift();
			
					var intent = intentParts.join('');
					
					var chatWindow = $('#chat' + intent);
					
					var Top = chatWindow.scrollTop();
		
					if(nom != username){
						chatWindow.append('<div class="message"><div class="name">' + nom + '</div><div class="message-text">' + body + '</div></div>');
					}else{
						chatWindow.append('<div class="message mine"><div class="message-text mine">' + body + '</div><div class="name mine">' + nom + '</div></div>');
					}

					if((-1)*(Top - document.getElementById('chat'+intent).scrollHeight) < 270)
chatWindow.scrollTop(document.getElementById('chat'+intent).scrollHeight);
					
					var box = chatWindow.parent().parent().parent();
					if(!$($(box.children().children().children()[2]).children().children()[0]).is(':focus')){
						box.addClass('new');
						$(box.children().children().children()[0]).attr('style', 'color:white;');
					}
				})
				hasCallbackBeenSet[parts[i]] = true;
			}
		}
	
		var xhttp = new XMLHttpRequest();
		
		xhttp.open("GET", "/subscribe?session=" + $.cookie('session') + "&phrases=" + parts.join(','), true);
		xhttp.send();
		
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
									console.log('u:' + username);
									if(response.records[j].name != username){
										records += '<div class="message"><div class="name">' + response.records[j].name + '</div><div class="message-text">' + response.records[j].body + '</div></div>';
									}else{
										records += '<div class="message mine"><div class="message-text mine">' + response.records[j].body + '</div><div class="name mine">' + response.records[j].name + '</div></div>';
									}
									
								}
							}
						
							var currentNomen = response.name;
						
							console.log(response);
						
							$('#dash' + bank[currentNomen]).html('<a id="a' + currentNomen + '" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected extra"><span class="content-wrapper"><span class="tile-content rap"><div class="nameheader">'+currentNomen+'</div><div id="chat' + currentNomen + '" class="chat-container">' + records + '</div><span class="tile-holder tile-holder-sm sendholder"><span class="title"><input id="type' + currentNomen + '" class="type-message"><button id="send' + nomen + '">send</button></span></span></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>');
			    	
							$('#send'+currentNomen).click(function(){
								var id = this.id;
			
								var rIntent = id.split('send')[1];
			
								var intent =  '/' + rIntent;
								var body = $('#type'+rIntent).val();
			
								socket.emit('chat', {
									intent:intent,
									body:body
								})
			
							})
		
							$('#type'+currentNomen).keypress(function(e){
								if(e.keyCode == 13){
									var id = this.id;
			
									var rIntent = id.split('type')[1];
			
									var intent = '/' + rIntent;
				
									var body = $(this).val();
									socket.emit('chat', {
										intent:intent,
										body:body
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
			
			$('.type-message').focus(function(){
				var box = $(this).parent().parent().parent().parent().parent();
				box.removeClass('new');
				$(box.children().children().children()[0]).attr('style', 'color:#111111;');
			})
		}
		
	}
}

function Block(nomen){
	return {
		id:'#send'+nomen,
		nomen:nomen,
		src: '<a id="0" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected extra"><span class="content-wrapper"><span class="tile-content rap"><div class="nameheader">'+nomen+'</div><div id="chat' + nomen + '" class="chat-container"></div><span class="tile-holder tile-holder-sm sendholder"><span class="title"><input id="type' + nomen + '" class="type-message"><button id="send' + nomen + '">send</button></span></span></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>'
	};
}