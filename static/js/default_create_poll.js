// This is the js for the default/index.html view.

var app = function() {

    var self = {};
    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };


    // not currently used, but we can, since I think it's faster than using find
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};


    // ##############################################################
    // Add poll
    self.add_poll = function () {
        $.ajax({
            type: 'POST',
            url: add_poll_url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(
                {
                    content: self.vue.form_content, 
                    movies: self.vue.movies,
                }),
            dataType: 'json',
            success: function (data) {
                console.log('Poll sent to server');
            }
        });
    };



    // ##############################################################
    // WIP
    // Add movies to the a "cart" that will be sent to the server when
    // the user clicks 'create poll'
    self.addMovie = function (movieId) {
        // should we add movies? or show times?
        alert("Added to poll:" + movieId);

    };



    // ##############################################################
    // searches the showtimes api for in-theater movies with the given name
    self.searchMovies = function () {
        console.log("in function searchMovies()");
        self.vue.searching = true;
        $.getJSON(search_movies_url,
            {
                form_title: self.vue.form_title,
            },
            function (data) {
                var jsonData = JSON.parse(data.response_content);
                console.log(jsonData);

                // assign key/value to each movie an array of showtimes
                // before we tie it to Vue so that Vue will track it
                jsonData.movies.forEach(function (movie) {
                    movie.showtimes = [];
                })
                self.vue.movies = jsonData.movies;

                self.getGeocoordsFromCity(function (data) {
                    var cinemaLocation = data; 
                    console.log(cinemaLocation);

                    self.getCinemas(cinemaLocation);

                    // for each movie, get the showtimes
                    self.vue.movies.forEach(function (data) {
                        var movie = data;
                        self.getShowtimes(movie.id, cinemaLocation);
                    })
                    self.vue.searching = false;
                });
            }
        )
    };


    // ##############################################################
    // Get showtimes of a movie in a given location
    // location is specified by vue.form_city
    self.getShowtimes = function (movieId, cinemaLocation) {
        console.log("in function getShowtimes()");
        var movie = self.vue.movies.find(movie => movie.id === movieId);
        
        self.getShowtimesFromApi(movieId, cinemaLocation, function (data) {
            movie.showtimes.forEach(function (showtime) {
                showtime.cinema = {};
            })
            movie.showtimes = data;
            // self.getCinemas(cinemaLocation);
        });


    };

    // Work in progress
    // instead of getting geo coord lat/long from the showtimes api
    // we can use google maps to get the lat/long from a given input of
    // city, zip, address or whatever else is supported
    self.getGeocoordsFromCity = function (callback) {
        console.log("in function getGeocoordsFromCity()");
        $.getJSON(get_cities_url,
            {
                form_city: self.vue.form_city,
            },
            function (data) {
                jsonData = JSON.parse(data.response_city);

                // Gets lat and lon of city
                // might need to add error check for city like if they type
                // 'se' all cities with that beginning name pop up
                var lat = jsonData.cities[0].lat;
                var lon = jsonData.cities[0].lon;
                var cinemaLocation = lat +','+lon;

                callback(cinemaLocation);
            }
        )        
    };


    // the actual call to the showtimes api
    self.getShowtimesFromApi = function (movieId, location, callback) {
        console.log("in get showtimes");
        $.getJSON(get_showtimes_url,
            {
                movie_id: movieId,
                location: location,
            },
            function (data) {
                var jsonData = JSON.parse(data.response_showtimes);
                var showtimes = jsonData.showtimes;
                callback(showtimes);
            }
        )
    };


    // might rewrite to cleanup
    self.getCinemas = function (location) {
        console.log("in getCinemas()");
        $.getJSON(get_cinemas_url,
            {
                location: location,
            },
            function (data) {
                jsonData = JSON.parse(data.response_cinemas);
                self.vue.cinemas = jsonData.cinemas;

                // // Work in progress
                // // match the showtime.cinema_id with the actual name
                // self.vue.showtimes.forEach(function (showtime) {
                //     var cinema = self.vue.cinemas.find(cinema => cinema.id === showtime.cinema_id);
                //     showtime.cinema_id = cinema.name; // lose the cinema id and get just the name 
                //     // right now we replace the id with the name                     
                // })
            }
        )
    };



    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            movies: [],
            cities:[],
            showtimes:[],
            location:[],
            cinemas:[],

            poll: {},
            poll_movies: [],

            logged_in: false,


            form_title: null,
            form_city:null,
            form_content: null,

            searching: false,
        },
        methods: {
            add_poll: self.add_poll,
            addMovie: self.addMovie,
            searchMovies: self.searchMovies,
            getGeocoordsFromCity: self.getGeocoordsFromCity,
            getShowtimesFromApi: self.getShowtimesFromApi,
            getCinemas: self.getCinemas,
            getShowtimes: self.getShowtimes,
        }


    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




