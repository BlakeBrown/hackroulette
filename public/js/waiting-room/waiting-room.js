$(document).ready(function() {

	var socket = io();

	$.get('/tweets')
        .done(function(res) {
            console.log(res);
            $.get('/interests', {body: res.tweets})
                .done(function(res2) {
                    console.log(res2);
                        socket.emit('userAuth', {
                        name: res.uid
                    });
                    var list = res2['interests'];
                    var tops = [];
                    for(var i = 0; i < 5; i++) {
                        var max = 0;
                        for(var key in list){
                            if(list[key] > max){
                                tops[i] = key;
                                max = list[key];
                            }
                        }
                        console.log(tops[i], max);
                        delete list[tops[i]];
                    }
                    console.log(tops);
                    $('.dataText').html('');
                    $('.dataText').append("<strong>The hacking wizards sense that you are interested in:</strong><br>");
                    for(var i = 0; i < 5; i++) {
                        $('.dataText').append(document.createTextNode(tops[i]),"<br>");
                    }
                });
        });

    $(".start_button").on("mouseenter", function() {
        // Set the button to it's current opacity
        var current_opacity = $(".start_button").css("opacity");
        $(".start_button").css("opacity", current_opacity);
        // Remove the animation
        $(".start_button").removeClass("animate-flicker");
        // Fade the button to an opacity of 1
        $(".start_button").fadeTo("slow", 1);
    });

    $(".start_button").on("mouseleave", function() {
        $(".start_button").addClass("animate-flicker");
    });

	setTimeout(function() {
	    $('.loadingLine').addClass('animated pulse').css('visibility','visible');
	},1000);

	// var items = Array("Is it ethical to get an abortion?", "Should be homeless be compensated?", "Does the government have a role in providing healthcare?", "Given our obsession with political correctness, does freedom of speech exist?", "How would you reform America's immigration policy?", "Should firearms be banned for public purchase in America?", "Should prisons be privately owned?", "Is America obligated to take a lead in solving global warming?", "Do you approve of Obama's current foreign policy?", "Should marijuana be legalized in the States?", "Does Chinese investment in America pose security threats?", "Does democracy stifle progress?");
	// topic = items[Math.floor(Math.random()*items.length)]
	// output = document.getElementById("output").innerHTML=topic;
});