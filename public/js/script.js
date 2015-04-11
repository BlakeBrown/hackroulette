$(document).ready(function() {

	$('#submit_btn').keyup(function (e) {
	    if (e.keyCode === 13) {
	    	var value = $(this).val();
	    	$.ajax({
	    		method: "get",
	    		url: "/tags",
	    		data: {
	    			value: value
	    		},
	    		success: function(response) {

	    		},
	    		error: function(response) {
	    			alert("Something went wrong");
	    		}
	    	})
	    }
	});

});