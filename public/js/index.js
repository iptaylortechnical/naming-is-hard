$( ".input" ).focusin(function() {
  $( this ).find( "span" ).animate({"opacity":"0"}, 200);
});

$( ".input" ).focusout(function() {
  $( this ).find( "span" ).animate({"opacity":"1"}, 300);
});

$(".login").submit(function(){
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		console.log('get here');
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
				var response = JSON.parse(xhttp.responseText);
				
				if(!response.err){
				  $(this).find(".submit i").removeAttr('class').addClass("fa fa-check").css({"color":"#fff"});
				  $(".submit").css({"background":"#2ecc71", "border-color":"#2ecc71"});
				  $(".feedback").show().animate({"opacity":"1", "bottom":"-80px"}, 400);
				  $("input").css({"border-color":"#2ecc71"});
					
					document.cookie = "session=" + response.session;
					
					window.location = '/';
				}
	    }
	};
	
	var username = document.getElementById('u').value;
	var password = document.getElementById('p').value;
	
	xhttp.open("POST", "/auth", true);
	xhttp.send({username, password});
	
	
  
  return false;
});
