$(document).ready(function() {

var socket = io();

	// On connection, add a user to the chat 
	socket.on('connect', function(){
		socket.emit('adduser');
	});

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

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
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
  