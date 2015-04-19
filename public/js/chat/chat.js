$(document).ready(function() {

	var socket = io();
	// Client is the currently connected user
	var client;

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

	// Store the client in a variable
	socket.on('store_connected_user', function(user) {
		client = user; 
	});	

	// Updates the chat with a message from the server
	socket.on('send_server_message', function (data) {
		$('#conversation').append('<span style="color:rgb(88, 231, 215)"><b>SERVER:</b> ' + data + '<br></span>');
	});

	// Updates the chat with a message from a user
	socket.on('send_message', function (user, data) {
		if(user.user_index == client.user_index) {
			$('#conversation').append('<span style="color:#FFDD2E"><b>You:</b> ' + data + '<br></span>');
		} else {
			$('#conversation').append('<b>' + user.user_name + ':</b> ' + data + '<br>');
		}
	});

	// When client clicks "send"
	$('#datasend').on("click", function(e) {
		e.preventDefault();
		var message = $('#data').val();
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
  