var typing_interval = self.options.typing_interval;

$(document).ready(function() {
  var timerIdentifier;

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
  if(movie_title.length > 2) { // zerx.co api doesn't support search movies with length > 3 letters
    $("#search_icon").fadeOut(400, function() {
      $(this).replaceWith("<div class='spinner glyphicon' id='loading_icon'></div>");
    });
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
    $("#movies").append("<div movie-url='" + movie.url + "' class='row movie-item'><div class='col-xs-2 poster-container'><img class='poster' src='" +
    movie.poster + "'></div><div class='col-xs-10 movie-data'><p class='title'>" +
    movie.name + "</p><p class='genres'>" +
    beauty_genres(movie.year, movie.genres) + "</p></div>" + "</div>").children(':last').hide().fadeIn(1000);
  });
  console.log('Movie container updated.');

  self.port.emit("resize-popup-height", 650);
  
  $("#loading_icon").fadeOut(400, function() {
    $(this).replaceWith("<i class='glyphicon glyphicon-search' id='search_icon'></i>");
  });
}

function beauty_genres(year, genres) {
  if(year.length == 0) return (genres).replace(/,/g, ", ");
  return (year + "," + genres).replace(/,/g, ", ");
}
