$(document).ready(function() {

	var socket = io();
	// Client is the currently connected user
	var client;

	// Custom prototype method to capitalize the first letter of a string
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

	// When the socket connects, get the client and add them to the chat
	socket.on('connect', function() {
		// Get the client
        $.ajax({
            method: 'get',
            url: 'user',
            success: function(response) {
                // Add the client to the chat
                socket.emit('add_client_to_chat', response);
            },
            error: function(response) {
                console.log(response);
            }
        })
	});

    // Gets the clients top 5 interests and stores them
	function getClientInterests() {
		$.get('/tweets')
	        .done(function(response) {
	            // Feed the list of tweets into Indico's API, getting the related topics/tags
		        $.get('/interests-for-chat', {body: response.tweets})
		            .done(function(response2) {
		            	var interests = response2.interests;
		            	// Format the top 5 results correctly
				        for(var i = 0; i < interests.length; i++) {
				            interests[i] = interests[i].replace(/_/g, " ").capitalizeFirstLetter();
				        }
		            	client.interests = interests;
		                socket.emit('store_interests', client);
		            });
	        });
	}

	// Called when a second user joins a chat room, shows the users common interests
	socket.on('show_common_interests', function(users) {

		var common_interests = [];

		for(var i = 0; i < users[0].interests.length; i++) {
			if(users[0].interests[i] == users[1].interests[i]) {
				common_interests.push(users[0].interests[i]);
			}
		}

		if(common_interests.length > 0) {
			common_interests_string = common_interests.toString().replace(/,/g , ", ");
			$("#output").html("<span>Common interests: " + common_interests_string + "</span>");
		} else {
			$("#output").html("<span>Aw it appears we couldn't find any obvious shared interests in this matchup. Why don't you talk to each other to see if we missed anything?</span>");
		}
	});

	// Resets the common interests box
	socket.on('user_left_room', function() {
		$("#output").html("<span>Waiting for another user to join... why not open a new tab to talk to yourself if you're bored? :)</span>");
	});

	// Store the client in a variable
	socket.on('store_connected_user', function(user) {
		client = user; 
        //Get the clients top 5 interests
        getClientInterests();
	});	

	// Updates the chat with a message from the server
	socket.on('send_server_message', function (data) {
		$('#conversation').append('<span style="color:rgb(88, 231, 215)"><b>SERVER:</b> ' + data + '<br></span>');
        $('#messages').animate({
            scrollTop: $('#messages')[0].scrollHeight + 'px'
        }, 0);
    });

	// Updates the chat with a message from a user
	socket.on('send_message', function (user, data) {
		if(user.user_index == client.user_index) {
			$('#conversation').append('<span style="color:#FFDD2E"><b>You:</b> ' + data + '<br></span>');
		} else {
			$('#conversation').append('<b>' + user.user_name + ':</b> ' + data + '<br>');
		}
        $('#messages').animate({
            scrollTop: $('#messages')[0].scrollHeight + 'px'
        }, 0);
	});

	// When client clicks "send"
	$('#datasend').on("click", function(e) {
		e.preventDefault();
		var message = $('#data').val().replace(/(<([^>]+)>)/ig,"");
		$('#data').val('');
		// Update the other users with the message
		socket.emit('sendchat', message);
	});

	// When the client hits ENTER on their keyboard
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			e.preventDefault();
			$('#datasend').click();
		}
	});
});
  
