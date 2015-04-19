$(document).ready(function() {

	var socket = io();
	// Client is the currently connected user
	var client;

	// On connection, add a user to the chat 
	socket.on('connect', function() {
		// Get the client
        $.ajax({
            method: 'get',
            url: 'user',
            success: function(response) {
                // Add the client to the waiting list
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

	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});
	});

	function switchRoom(room){
		socket.emit('switchRoom', room);
	}

	// on load of page
	$(function(){
		// when the client clicks SEND
		$('#datasend').on("click", function(e) {
			e.preventDefault();
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				e.preventDefault();
				$('#datasend').click();
			}
		});
	});
});
  