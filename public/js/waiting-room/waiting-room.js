$(document).ready(function() {

	var socket = io();

    // Custom prototype method to capitalize the first letter of a string
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // Get a list of tweets from twitter
	$.get('/tweets')
        .done(function(response) {
            // Add the client to the waiting list
            addClientToWaitingList();
            // Feed the list of tweets into Indico's API, getting the related topics/tags
            addClientInterests(response);
        });

    // Gets an authenticated client and adds them to waiting list, notifying all users
    function addClientToWaitingList() {
        // Get the client
        $.ajax({
            method: 'get',
            url: 'user',
            success: function(response) {
                // Add the client to the waiting list
                socket.emit('add_client_to_waiting_list', response);
            },
            error: function(response) {
                console.log(response);
            }
        })
    }

    // Gets the list of interests for an authenticated client and appends them to the waiting room
    function addClientInterests(res) {
        $.get('/interests', {body: res.tweets})
            .done(function(res2) {
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
    }

    // When a client joins, add their username to the waiting room
    socket.on('client_joined_waiting_room', function(username) {
        $('#users_waiting_list').append('<li class="user_list_item" id="client_list_item" data-username="' + username+ '">' + username + ' (You!)</li>');
    });

    // When a client joins, get the other users in the waiting room
    socket.on('get_other_users_in_waiting_room', function(usernames) {
        for(var key in usernames) {
            $('#users_waiting_list').append('<li class="user_list_item" data-username="' + key + '">' + key + '</li>');
        }
    });

    // When a client joins, update all the other users (excluding the client) with the new user
    socket.on('user_joined_waiting_room', function(username) {
        $('#users_waiting_list').append('<li class="user_list_item" data-username="' + username + '">' + username + '</li>');
    });

    // When a client leaves, update all the other users
    socket.on('user_left_waiting_room', function(username) {
        $('.user_list_item[data-username="' + username + '"').remove();
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