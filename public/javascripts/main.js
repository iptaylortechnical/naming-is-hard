var scheduled;
var timeScheduled;
var amountOfBlocks = 0;

var modelBlocks = [];
var shownBlocks = [];

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
});

function updateBlocks(){
	console.log('checked');
	
	var text = $('.in').val();
	console.log('test');
	var parts = text.split(' ');
	
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
	
	consistent = consistent ? (!!modelBlocks[0] == !!shownBlocks[0] : false);
	
	if(!consistent){
		
		shownBlocks = [];
		
		var total = '';
		for(var i = 0; i < parts.length; i++){
			if(modelBlocks[i]){
				var block = modelBlocks[i];
				total = total + block.src;
				shownBlocks[i] = block;
			}
		}
	
		$('#answers').html(total);
		
		amountOfBlocks = parts.length;
		consistent = true;
	}
}

function Block(nomen){
	console.log(nomen);
	return {
		nomen:nomen,
		src: '<a id="0" 0.41s;="" class="tile tile-lg tile-grey ripple-effect animated selected extra"><span class="content-wrapper"><span class="tile-content"><div class="chat-container">Connect to client: ' + nomen + '</div><span class="tile-holder tile-holder-sm sendholder"><span class="title"><input class="type-message"><button>send</button></span></span></span></span><span 270px;=" " width:=" " top:=" " 104px;=" " left:=" " -44px;="" class="ink animate"></span></a>'
	};
}