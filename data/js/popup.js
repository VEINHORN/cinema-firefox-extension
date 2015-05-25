var typing_interval = self.options.typing_interval;

$(document).ready(function() {
  var timerId;

  $('#redirect_btn').click(createHomePageTab);
  $(document).on("click", ".movie-item", createMovieTab);

  $('#search_field').keyup(function() {
      clearTimeout(timerId);
      timerId = setTimeout(updateMovieContainer, typing_interval);
    });
    $('#search_field').keydown(function() {
      clearTimeout(timerId);
    });
});

self.port.on("focus-search-field", function() {
  $('#search_field').focus();
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
    self.port.emit("resize-popup-height", 100);
    self.port.emit("resize-popup-width", 420);
  }
}

function clearMoviesContainer() {
  $(".movie-item").remove();
}

function updateMovies(movies) {
  clearMoviesContainer();

  $.each(movies, function(index, movie) {
    var movieDiv = $('<div>').addClass('row movie-item').attr('movie-url', movie.url);
    var posterDiv = $('<div>').addClass('col-xs-2 poster-container');
    var movieDataDiv = $('<div>').addClass('col-xs-10 movie-data');

    var poster = $('<img>').addClass('poster').attr('src', movie.poster);
    var title = $('<p>').addClass('title').text(movie.name);
    var genres = $('<p>').addClass('genres').text(beauty_genres(movie.year, movie.genres));

    posterDiv.append(poster);
    movieDataDiv.append(title).append(genres);
    movieDiv.append(posterDiv).append(movieDataDiv);

    $('#movies').append(movieDiv).children(':last').hide().fadeIn(1000);
  });
  console.log('Movie container updated.');

  self.port.emit("resize-popup-height", 650);
  self.port.emit("resize-popup-width", 430);

  $("#loading_icon").fadeOut(400, function() {
    $(this).replaceWith("<i class='glyphicon glyphicon-search' id='search_icon'></i>");
  });
}

function beauty_genres(year, genres) {
  if(year.length == 0) return (genres).replace(/,/g, ", ");
  return (year + "," + genres).replace(/,/g, ", ");
}
