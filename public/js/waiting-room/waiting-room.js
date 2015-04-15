$(document).ready(function() {

	var num = 0, style = document.getElementById('loadingText').style;
	
	window.setInterval(function () {

		setTimeout(function() {
		    $('.crystal').removeClass('fadeOut');
		    $('.crystal').addClass('animated fadeIn').css('visibility', 'visible');
		    $('.crystal').animate({transform: "translateY(-10%)"});
		}, num);

		num = num+800

		setTimeout(function() {
		    $('.crystal').removeClass('fadeIn');
		    $('.crystal').addClass('fadeOut');
		}, num);

	}, 800);

	setTimeout(function() {
	    $('.loadingLine').addClass('animated pulse').css('visibility','visible');
	},1000);

	var items = Array("Is it ethical to get an abortion?", "Should be homeless be compensated?", "Does the government have a role in providing healthcare?", "Given our obsession with political correctness, does freedom of speech exist?", "How would you reform America's immigration policy?", "Should firearms be banned for public purchase in America?", "Should prisons be privately owned?", "Is America obligated to take a lead in solving global warming?", "Do you approve of Obama's current foreign policy?", "Should marijuana be legalized in the States?", "Does Chinese investment in America pose security threats?", "Does democracy stifle progress?");
	topic = items[Math.floor(Math.random()*items.length)]
	output = document.getElementById("output").innerHTML=topic;
});