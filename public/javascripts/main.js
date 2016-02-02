var scheduled;
var timeScheduled;
var amountOfBlocks = 0;

var modelBlocks = [];
var shownBlocks = [];
var idBlocks = {};
var pos = 0;

//TODO: VERY TEMPORARY
var lastBody = '';

var socket = io(':3000');

socket.on('auth', function(){
	console.log('got auth request, sending cookie');
	socket.emit('authresponse', $.cookie('session'));
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
	console.log('checked');
	
	var text = $('.in').val();
	
	console.log('test');
	var parts = text.split(' ');
	
	for(var i = 0; i < parts.length; i++){
		socket.on(parts[i], function(msg){
			var rIntent = msg.intent;
			var body = msg.body;
			var nom = msg.name;
			
			var intentParts = rIntent.split('');
			intentParts.shift();
			
			var intent = intentParts.join('');
			
			pos += 40;
			$('#chat'+intent).scrollTop(pos);
			
			if(body != lastBody){
				$('#chat' + intent).append('<div class="message"><div class="name">' + nom + '</div><div class="message-text">' + body + '</div></div>');
				lastBody = body;
			}
		})
	}
	
	var xhttp = new XMLHttpRequest();

	xhttp.open("GET", "/subscribe?session=" + $.cookie('session') + "&phrases=" + parts.join(','), true);
	xhttp.send();
	
	modelBlocks = [];
	console.log(parts.length);
	for(var i = 0; i < parts.length; i++){
		if(parts[i][0] == '@' || parts[i][0] == '/'){
			
			var n = parts[i].split('');
			n.shift();
			nN = n.join('');
			
			var block = Block(nN);
			modelBlocks[i] = block;
		
			if(consistent){
				consistent = !!shownBlocks[i] ? modelBlocks[i].nomen == shownBlocks[i].nomen : false;
			}
		}
	}
	
	consistent = consistent ? (!!modelBlocks[0] == !!shownBlocks[0]) : false;
	
	if(!consistent){
		
		shownBlocks = [];
		
		var total = '';
		for(var i = 0; i < parts.length; i++){
			if(modelBlocks[i]){
				var block = modelBlocks[i];
				total = total + block.src;
				shownBlocks[i] = block;
				idBlocks[block.id] = block;
			}
		}
	
		$('#answers').html(total);
		
		amountOfBlocks = parts.length;
		consistent = true;
		
		$('button').click(function(){
			var id = this.id;
			
			var rIntent = id.split('send')[1];
			
			var intent = '/' + rIntent;
			var body = $('#type'+rIntent).val();
			
			socket.emit('chat', {
				intent:intent,
				body:body
			})
			
		})
		
		$('.type-message').keypress(function(e){
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
}

function Block(nomen){
	console.log(nomen);
	return {
		id:'#send'+nomen,
		nomen:nomen,
		src: '<a id="0" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected extra"><span class="content-wrapper"><span class="tile-content"><div id="chat' + nomen + '" class="chat-container"></div><span class="tile-holder tile-holder-sm sendholder"><span class="title"><input id="type' + nomen + '" class="type-message"><button id="send' + nomen + '">send</button></span></span></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>'
	};
}