var scheduled;
var timeScheduled;
var amountOfBlocks = 0;

var isAuthenticated = false;

var PRODUCTION = true;

var modelBlocks = [];
var shownBlocks = [];
var idBlocks = {};

var bank = {};

var hasCallbackBeenSet = {};

//TODO: VERY TEMPORARY
var lastBody = '';

var socket = io(PRODUCTION ? ':80' : ':3000');

socket.on('auth', function(){
	console.log('got auth request, sending cookie');
	socket.emit('authresponse', $.cookie('session'));
})

socket.on('authenticated', function(){
	console.log('authenticated, now can start running code blocks');
	isAuthenticated = true;
})

socket.on('disconnected', function(){
	isAuthenticated = false;
})

var consistent = false;

$(document).ready(function(){
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
	
	updateBlocks();
	
});

function updateBlocks(){
	if(isAuthenticated){
		console.log('checked');
	
		var text = $('.in').val();
	
		var parts = text.split(' ');
		
		console.log(parts);
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
				
					$('#chat'+intent).scrollTop(document.getElementById('chat'+intent).scrollHeight)
			
					//if(body != lastBody){
						$('#chat' + intent).append('<div class="message"><div class="name">' + nom + '</div><div class="message-text">' + body + '</div></div>');
						//lastBody = body;
						//}
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
		
		for(var i = 0; i < partsLength; i++){
			if(!($('#dash' + i).children().attr('id') == "a" + parts[i])){
				var nomen = parts[i].split('');
				nomen.shift();
				nomen = nomen.join('');
				
				bank[nomen] = i;
				
				var xhttp = new XMLHttpRequest();
				
				var records = '';
				
				xhttp.onreadystatechange = function() {
			    if (xhttp.readyState == 4 && xhttp.status == 200) {
						var response = JSON.parse(xhttp.responseText);
						if(!response.err){
					  	var recordLength = response.records.length;
							
							for(var j = 0; j < recordLength; j++){
								records += '<div class="message"><div class="name">' + response.records[j].name + '</div><div class="message-text">' + response.records[j].body + '</div></div>';
							}
						}
						
						$('#dash' + bank[nomen]).html('<a id="a' + nomen + '" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected extra"><span class="content-wrapper"><span class="tile-content rap"><div class="nameheader">'+nomen+'</div><div id="chat' + nomen + '" class="chat-container">' + records + '</div><span class="tile-holder tile-holder-sm sendholder"><span class="title"><input id="type' + nomen + '" class="type-message"><button id="send' + nomen + '">send</button></span></span></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>');
			    	
						$('#send'+nomen).click(function(){
							var id = this.id;
			
							var rIntent = id.split('send')[1];
			
							var intent =  '/' + rIntent;
							var body = $('#type'+rIntent).val();
			
							socket.emit('chat', {
								intent:intent,
								body:body
							})
			
						})
		
						$('#type'+nomen).keypress(function(e){
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
			}
		}
		
		// modelBlocks = [];
// 		for(var i = 0; i < parts.length; i++){
// 			if(parts[i][0] == '@' || parts[i][0] == '/'){
//
// 				var n = parts[i].split('');
// 				n.shift();
// 				nN = n.join('');
//
// 				var block = Block(nN);
// 				modelBlocks[i] = block;
//
// 				if(consistent){
// 					consistent = !!shownBlocks[i] ? modelBlocks[i].nomen == shownBlocks[i].nomen : false;
// 				}
// 			}
// 		}
//
// 		consistent = consistent ? (!!modelBlocks[0] == !!shownBlocks[0]) : false;
//
// 		if(!consistent){
//
// 			shownBlocks = [];
//
// 			var total = '';
// 			for(var i = 0; i < parts.length; i++){
// 				if(modelBlocks[i]){
// 					var block = modelBlocks[i];
// 					total = total + block.src;
// 					shownBlocks[i] = block;
// 					idBlocks[block.id] = block;
// 				}
// 			}
//
// 			$('#answers').html(total);
//
// 			amountOfBlocks = parts.length;
// 			consistent = true;
	}
}

function Block(nomen){
	return {
		id:'#send'+nomen,
		nomen:nomen,
		src: '<a id="0" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected extra"><span class="content-wrapper"><span class="tile-content rap"><div class="nameheader">'+nomen+'</div><div id="chat' + nomen + '" class="chat-container"></div><span class="tile-holder tile-holder-sm sendholder"><span class="title"><input id="type' + nomen + '" class="type-message"><button id="send' + nomen + '">send</button></span></span></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>'
	};
}