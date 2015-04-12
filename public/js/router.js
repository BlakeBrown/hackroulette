$(document).ready(function() {
  // ROUTES
  var socket = io();
  var index = function() {
    console.log('welcome!');
  };
  var chat = function() {};
  var waitingRoom = function() {
    console.log('Welcome to the waiting room bitch');
    $.get('/tweets')
      .done(function(res) {
        console.log(res);
        $.get('/interests', {body: res.tweets})
          .done(function(res2) {
              console.log(res2);
              socket.emit('user auth', {
                name: res.uid
              });
          });
      });
  };
  socket.on('enable_start_button', function() {
    $('.startButton').attr('disabled', false);
  });
  var routes = {
    '/home': index,
    '/waitingRoom': waitingRoom,
    '/chat': chat
  };

  var allroutes = function() {
    var route = window.location.hash.slice(2);
    var sections = $('section');
    var section;

    section = sections.filter('[data-route=' + route + ']');

    if (section.length) {
      sections.hide(250);
      section.show(250);
    }
  };
  var router = Router(routes);
  router.configure({
    on: allroutes
  });
  router.init();
  if (window.location.hash.slice(2).length === 0)
    router.setRoute('/home');
});
