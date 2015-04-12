var main = function() {

  $('.window').waypoint(function() {
    $('.title').addClass('animated fadeIn').css( 'visibility','visible' );
    }, {offset:'0px'}
    );

  $('.window').waypoint(function() {
    setTimeout(function() {
      $('.subtitle').addClass('animated fadeIn').css('visibility','visible');
      },1000);
  }, {offset:'0px'});

    $('.window').waypoint(function() {
    setTimeout(function() {
      $('.joinButton').addClass('animated fadeIn').css('visibility','visible');
      },1000);
  }, {offset:'0px'});

    $('.window').waypoint(function() {
    setTimeout(function() {
      $('.joinButtonBuffer').addClass('animated fadeIn').css('visibility','visible');
      },1000);
  }, {offset:'0px'});

    $('.window').waypoint(function() {
    setTimeout(function() {
      $('.loadingLine').addClass('animated pulse').css('visibility','visible');
      },1000);
  }, {offset:'0px'});

    var items = Array("Is it ethical to get an abortion?", "Should be homeless be compensated?", "Does the government have a role in providing healthcare?", "Given our obsession with political correctness, does freedom of speech exist?", "How would you reform America's immigration policy?", "Should firearms be banned for public purchase in America?", "Should prisons be privately owned?", "Is America obligated to take a lead in solving global warming?", "Do you approve of Obama's current foreign policy?", "Should marijuana be legalized in the States?", "Does Chinese investment in America pose security threats?", "Does democracy stifle progress?");
    topic = items[Math.floor(Math.random()*items.length)]
    output = document.getElementById("output").innerHTML=topic;

}

particlesJS('particles-js', {
  particles: {
    color: '#fff',
    color_random: false,
    shape: 'circle', // "circle", "edge" or "triangle"
    opacity: {
      opacity: 1,
      anim: {
        enable: false,
        speed: 1.5,
        opacity_min: 0,
        sync: false
      }
    },
    size: 2.5,
    size_random: true,
    nb: 100,
    line_linked: {
      enable_auto: true,
      distance: 140,
      color: '#fff',
      opacity: 1,
      width: 1,
      condensed_mode: {
        enable: false,
        rotateX: 600,
        rotateY: 600
      }
    },
    anim: {
      enable: true,
      speed: 1
    }
  },
  interactivity: {
    enable: true,
    mouse: {
      distance: 250
    },
    detect_on: 'canvas', // "canvas" or "window"
    mode: 'grab', // "grab" of false
    line_linked: {
      opacity: .5
    },
    events: {
      onclick: {
        enable: true,
        mode: 'push', // "push" or "remove"
        nb: 4
      },
      onresize: {
        enable: true,
        mode: 'out', // "out" or "bounce"
        density_auto: false,
        density_area: 800 // nb_particles = particles.nb * (canvas width *  canvas height / 1000) / density_area
      }
    }
  },
  /* Retina Display Support */
  retina_detect: true
});

$(document).ready(main);