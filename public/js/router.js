$(document).ready(function() {

    var socket = io();
    var index = function() {
        console.log('welcome!');
    };
    var chat = function() {};
    var waitingRoom = function() {
    console.log('Welcome to the waiting room bitch');

    };
    socket.on('enable start button', function() {
    $('.startButton').attr('disabled', false);
    });
});