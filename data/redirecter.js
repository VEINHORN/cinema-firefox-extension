//window.location.href = "http://stackoverflow.com";

var current_url = window.location.href;
var active_domain = self.options.active_domain;
var domains_to_redirect = self.options.domains_to_redirect;

domains_to_redirect.split(',').forEach(function(element, index, array) {
  if(current_url.indexOf(active_domain) === -1 && current_url.indexOf(element) > -1) {
    window.location.href = changeDomain(current_url, active_domain);
  }
});

function changeDomain(movie_url, redirect_domain) {
  var domain = movie_url.replace("http://", "").replace(/[/].*/, "");
  return movie_url.replace(domain, redirect_domain);
}
