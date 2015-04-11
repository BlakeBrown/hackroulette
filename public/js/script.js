$(document).ready(function() {

	$('#submit_btn').keyup(function (e) {
	    if (e.keyCode === 13) {
	    	var value = $(this).val();

    		var data = {};
				data.title = "title";
				data.message = "message";

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

	    	$.get("tags", "hello");
	    }
	});

});