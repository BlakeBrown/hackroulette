$(document).ready(function() {

	var socket = io();

    // Custom prototype method to capitalize the first letter of a string
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // Get a list of tweets from twitter
	$.get('/tweets')
        .done(function(res) {
            // Feed the list of tweets into Indico's API, getting the related topics/tags
            $.get('/interests', {body: res.tweets})
                .done(function(res2) {
                        socket.emit('userAuth', {
                        name: res.uid
                    });
                    // Grab only the top 5 tags
                    var list = res2['interests'];
                    var interests = [];
                    for(var i = 0; i < 5; i++) {
                        var max = 0;
                        for(var key in list){
                            if(list[key] > max){
                                interests[i] = key;
                                max = list[key];
                            }
                        }
                        delete list[interests[i]];
                    }
                    // Append the top 5 tags to the DOM
                    $('.dataText').html('');
                    $('.dataText').append("<strong style='margin-bottom:15px; display:block'>The hacking wizards sense that you are interested in:</strong>");
                    for(var i = 0; i < 5; i++) {
                        $('.dataText').append("<p style='margin-top:0; margin-bottom:10px'>" + (i+1) + " - " + interests[i].replace(/_/g, " ").capitalizeFirstLetter() + "</p>");
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
        $(".start_button").fadeTo(100, 1, function() {
            $(".start_button").addClass("start_button_after_fade_in");
        });
    });

    $(".start_button").on("mouseleave", function() {
        $(".start_button").addClass("animate-flicker");
        $(".start_button").removeClass("start_button_after_fade_in");
    });

	setTimeout(function() {
	    $('.loadingLine').addClass('animated pulse').css('visibility','visible');
	},1000);

});