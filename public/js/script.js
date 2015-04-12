$(document).ready(function() {

  // ROUTES
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

  var index = function() {
    console.log('welcome!');
  };
  var waitingRoom = function() {
    console.log('Welcome to the waiting room');
  };
  var routes = {
    '/home': index,
    '/waitingRoom': waitingRoom
  };
  var router = Router(routes);
  router.configure({
    on: allroutes
  });
  router.init();
  router.setRoute('/home');
  // End router config

	$('#submit_btn').keyup(function (e) {
	    if (e.keyCode === 13) {
	    	var value = $(this).val();

    		var data = {};
				data.title = "title";
				data.message = value;
				console.log(data);
        $.get('tags', {body: data})
          .done(function(res) {
            console.log(data)
        });

	    	// $.ajax({
	    	// 	method: "get",
	    	// 	url: "tags",
	    	// 	data: {
	    	// 		test: "hello"
	    	// 	},
	    	// 	success: function(response) {
	    	// 		console.log(response);
	    	// 	},
	    	// 	error: function(response) {
	    	// 		alert("Something went wrong");
	    	// 		console.log(response);
	    	// 	}
	    	// });

	    	// $.get("tags", "hello");
	    }
	});

});