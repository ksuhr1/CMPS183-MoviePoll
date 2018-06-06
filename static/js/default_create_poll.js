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
    self.add_movie = function () {
        // The submit button to add a track has been added.
        var movie = {
            title: self.vue.form_title
        };

        self.vue.poll_movies.push(movie);

    };



    // ##############################################################
    // searches the showtimes api for in-theater movies with the given name
    self.searchMovies = function () {
        console.log("in function searchMovies()");
        $.getJSON(search_movies_url,
            {
                form_title: self.vue.form_title,
            },
            function (data) {
                jsonData = JSON.parse(data.response_content);
                console.log(jsonData);
                self.vue.movies = jsonData.movies;
            }
        )
    };


    // ##############################################################
    // Get showtimes of a movie in a given location
    // location is specified by vue.form_city
    self.getShowtimes = function (movieId) {
        console.log("in function getShowtimes()");

        self.getGeocoordsFromCity(function(data) {
            var cinemaLocation = data; 
            console.log(cinemaLocation)
            // get the list of cinemas near geocoord location
            
            self.getShowtimesFromApi(movieId, cinemaLocation, function() {
                self.getCinemas(cinemaLocation);
            });
        });
    };

    // WIP
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
                console.log(jsonData);

                // Gets lat and lon of city
                // might need to add error check for city like if they type
                // 'se' all cities with that beginning name pop up
                var lat = jsonData.cities[0].lat;
                var lon = jsonData.cities[0].lon;
                var cinemaLocation = lat +','+lon;

                // self.vue.getShowtimesFromApi(movieId, location);
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
                jsonData = JSON.parse(data.response_showtimes);
                var movie = self.vue.movies.find(movie => movie.id === movieId);
                console.log("movie: ");
                console.log(movie);
                
                movie.showtimes = jsonData.showtimes;
                self.vue.showtimes = jsonData.showtimes;
                console.log("movie.showtimes");
                console.log(movie.showtimes);


                //  //Goes through the list of movies and gets the id
                // for(var i in self.vue.showtimes){
                //     var cinema_id = self.vue.showtimes[i].cinema_id;
                //     //console.log(cinema_id);
                // }
                // self.vue.getCinemas(cinema_id,location);
                callback();
            }
        )
    };

    self.getCinemas = function (location) {
        console.log("in getCinemas()");
        $.getJSON(get_cinemas_url,
            {
                location: location,
            },
            function (data) {
                jsonData = JSON.parse(data.response_cinemas);
                self.vue.cinemas = jsonData.cinemas;
                console.log("cinemas:");
                console.log(self.vue.cinemas);

                // Work in progress
                // match the showtime.cinema_id with the actual name
                self.vue.showtimes.forEach(function (showtime) {
                    var cinema = self.vue.cinemas.find(cinema => cinema.id === showtime.cinema_id);
                    showtime.cinema_id = cinema.name; // lose the cinema id and get just the name 
                    // right now we replace the id with the name                     
                })  
            }
        )
    };



    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            movies: [
                {
                    title: "lala",
                    showtimes: [{start_at: "7:50PM",}, {start_at: "7:50PM",},],
                },
            ],
            cities:[
                {lat:"",lon:""},
            ],
            showtimes:[],
            location:[],
            cinemas:[],

            poll: {},
            poll_movies: [],

            logged_in: false,


            form_title: null,
            form_city:null,
            form_content: null,

        },
        methods: {
            add_poll: self.add_poll,
            add_movie: self.add_movie,
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




