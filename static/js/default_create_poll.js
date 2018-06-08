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
    // Create the poll
    self.createPoll = function () {
        $.ajax({
            type: 'POST',
            url: add_poll_url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(
                {
                    content: self.vue.form_content, 
                    movies: self.vue.pollMovies,
                    showtimes: self.vue.pollShowtimes,
                }),
            dataType: 'json',
            success: function (data) {
                console.log('Poll sent to server');
                var pollId = data.poll.id;
                // redirect to the voting page
                window.location = results_url + '/' + pollId;
            }
        });
    };



    // ##############################################################
    // add poll option to the poll
    self.addMovie = function (movieId, showtimeId) {
        var movie = self.vue.movies.find( movie => movie.id === movieId );
        var showtime = movie.showtimes.find( showtime => showtime.id === showtimeId );

        var inCart = self.vue.pollShowtimes.find( showtime => showtime.id === showtimeId );

        if (!(inCart)) {
            self.vue.pollShowtimes.push(showtime);    
        } else {
            var shoppingCartIndex = self.vue.pollShowtimes.indexOf(showtime);
            self.vue.pollShowtimes.splice(shoppingCartIndex, 1); // delete image from cart
        }        
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

            // movie.showtimes.forEach(function (showtime) {
            //     showtime.cinema = {};
            // })
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
            }
        )
    };


    self.convertDate = function (isoDate) {
        var formattedDate;
        var event = new Date(isoDate);        
        var options = { hour: 'numeric', minute: 'numeric' };
        formattedDate = event.toDateString() + " at " 
            + event.toLocaleTimeString('en-US', options);
        return formattedDate;
    }


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
            pollShowtimes: [],
            pollMovies: [],

            logged_in: false,


            form_title: null,
            form_city:null,
            form_content: null,

            searching: false,
        },
        methods: {
            createPoll: self.createPoll,
            addMovie: self.addMovie,
            searchMovies: self.searchMovies,
            getGeocoordsFromCity: self.getGeocoordsFromCity,
            getShowtimesFromApi: self.getShowtimesFromApi,
            getCinemas: self.getCinemas,
            getShowtimes: self.getShowtimes,
            convertDate: self.convertDate,
        }


    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




