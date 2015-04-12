var main = function() {

  $('.window').waypoint(function() {
    $('.title').addClass('animated fadeIn').css( 'visibility','visible' );
    }, {offset:'0px'}
    );
}


$(document).ready(main);

window.onload = function start() {
    slide();
    startButton();
}

function slide() {
    var num = 0, style = document.getElementById('loadingText').style;
    window.setInterval(function () {

    setTimeout(function() {
      $('.loadingText').removeClass('fadeOut');
      $('.loadingText').addClass('animated fadeIn').css('visibility','visible');
      },num);

    num = num+500

    setTimeout(function() {
      $('.loadingText').removeClass('fadeIn');
      $('.loadingText').addClass('fadeOut');
      },num);

    }, 500);
}

function startButton() {
  $('.window').waypoint(function() {
    $('.startButton').addClass('animated fadeIn').css( 'visibility','visible' );
    }, {offset:'0px'}
    );
}
