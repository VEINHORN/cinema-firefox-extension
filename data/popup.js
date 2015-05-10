var typing_interval = self.options.typing_interval;
var active_domain = self.options.active_domain;

$(document).ready(function() {
  var timerIdentifier;
  
  console.log("Typing interval: " + typing_interval);

  $('#search_field').focus();
  $('#redirect_btn').click(createHomePageTab);
  $(document).on("click",".movie-item", createMovieTab);

  $('#search_field').keyup(function() {
      clearTimeout(timerIdentifier);
      timerIdentifier = setTimeout(updateMovieContainer, typing_interval);
    });
    $('#search_field').keydown(function() {
      clearTimeout(timerIdentifier);
    });
});

function createHomePageTab() {
  self.port.emit("create-tab", 'http://zerx.co');
}

function createMovieTab() {
  self.port.emit("create-tab", $(this).attr('movie-url'));
}

function updateMovieContainer() {
  var url = "http://zerx.co/?do=search&subaction=search&mode=advanced&free&story=";
  var movie_title = $('#search_field').val();
  if(movie_title.length > 2) {
    var query = url + movie_title;
    $.get(query, function(data) {
      var movies = $.parseJSON(data);
      updateMovies(movies);
    });
  } else {
    clearMoviesContainer();
  }
}

function clearMoviesContainer() {
  $(".movie-item").remove();
}

function updateMovies(movies) {
  clearMoviesContainer();

  $.each(movies, function(index, movie) {
    $("#movies").append("<div movie-url='" + changeDomain(movie.url, active_domain) + "' class='row movie-item'><div class='col-xs-2 poster-container'><img class='poster' src='" +
    movie.poster + "'></div><div class='col-xs-10 movie-data'><p class='title'>" +
    movie.name + "</p><p class='genres'>" +
    beauty_genres(movie.year, movie.genres) + "</p></div>" + "</div>").children(':last').hide().fadeIn(1000);
  });
  console.log('Movie container updated.');
}

function beauty_genres(year, genres) {
  if(year.length == 0) return (genres).replace(/,/g, ", ");
  return (year + "," + genres).replace(/,/g, ", ");
}

function changeDomain(movie_url, redirect_domain) {
  var domain = movie_url.replace("http://", "").replace(/[/].*/, "");
  return movie_url.replace(domain, redirect_domain);
}
