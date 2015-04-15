$(document).ready(function() {

    $('.title').addClass('animated fadeIn').css('visibility', 'visible');
    $('.startButton').addClass('animated fadeIn').css('visibility','visible');

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

});



