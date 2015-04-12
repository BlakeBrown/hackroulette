$(document).ready(function() {
  // ROUTES
  var index = function() {
    console.log('welcome!');
  };
  var waitingRoom = function() {
    console.log('Welcome to the waiting room bitch');
    $.get('/tweets')
          .done(function(res) {
            console.log(res);
            $.get('/interests', {body: res})
                .done(function(res2) {
                    console.log(res2);
                });
          });
  };
  var routes = {
    '/home': index,
    '/waitingRoom': waitingRoom
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
