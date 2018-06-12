// This is the js for the default/index.html view.

var app = function () {

    var self = {};
    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };


    // not currently used, but we can, since I think it's faster than using find
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};


    // ##############################################################
    // Create the poll
    self.createPoll = function () {
        if (self.vue.pollMovies.length > 0) {
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
                    window.location = vote_url + '/' + pollId;
                },
                error: function (data) {
                    console.log(data);
                    alert("Something went wrong");
                }
            });
        } else {
            alert("Poll cannot be empty!");
        }
    };



    // ##############################################################
    // add poll option to the poll
    self.addMovie = function (movieId, showtimeId) {
        var movie = self.vue.movies.find( movie => movie.id === movieId );
        var showtime = movie.showtimes.find( showtime => showtime.id === showtimeId );

        var showtimeInCart = self.vue.pollShowtimes.find( showtime => showtime.id === showtimeId );
        var movieInCart = self.vue.pollMovies.find( movie => movie.id === movieId );


        if (!(showtimeInCart)) {
            self.vue.pollShowtimes.push(showtime);
            
            // if movie is not in cart, push the movie to pollMovies []
            if (!(movieInCart)) {
                self.vue.pollMovies.push(movie);
            }
        } else {
            var showtimeCartIndex = self.vue.pollShowtimes.indexOf(showtime);
            self.vue.pollShowtimes.splice(showtimeCartIndex, 1);
            
            // if movie is in cart and none of the pollShowtimes [] has the movie then remove it
            var movieInShowtimes = self.vue.pollShowtimes.find( showtime => showtime.movie_id === movieId );
            var movieCartIndex = self.vue.pollShowtimes.indexOf(showtime);
            if (movieInCart && !(movieInShowtimes)) {
                self.vue.pollMovies.splice(movieCartIndex, 1);          
            }
        }

        console.log("showtimeInCart", self.vue.pollShowtimes);
        console.log("movie", self.vue.pollMovies);
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
                    self.vue.movies.forEach(function (movie) {
                        var movie = movie;
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
            var showtimes = data;
            showtimes.forEach(function (showtime) {
                showtime.time = self.convertTime(showtime.start_at);
                showtime.date = self.convertDate(showtime.start_at);
            });

            movie.showtimes = showtimes;
            // self.extractShowtimeDates(movie.showtimes);
        });
    };

    // the actual call to the showtimes api
    self.getShowtimesFromApi = function (movieId, location, callback) {
        console.log("in getShowtimesFromApi()");
        var currentTime = new Date().toDateString();
        $.getJSON(get_showtimes_ist_url,
            {
                movie_id: movieId,
                location: location,
                timeFrom: currentTime,
            },
            function (data) {
                var jsonData = JSON.parse(data.response_showtimes);
                var showtimes = jsonData.showtimes;
                callback(showtimes);
            }
        )
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


    // might rewrite to cleanup
    // not needed if we get cinemas in the getShowtimes function
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



    // ##############################################################
    // Date handling
    self.convertDate = function (isoDate) {
        var formattedDate;
        var event = new Date(isoDate);
        formattedDate = event.toDateString();
        return formattedDate;
    };

    self.convertTime = function (isoDate) {
        var formattedTime;
        var event = new Date(isoDate);
        var options = { hour: 'numeric', minute: 'numeric' };
        formattedTime = event.toLocaleTimeString('en-US', options);
        return formattedTime;
    };

    // decrease the date by 1 for regal movies
    // because the api provides the incorrect links
    self.dateErrorHandle = function (isoDate) {
        var formattedDate;
        var event = new Date(isoDate);
        event.setDate(event.getDate()-1);
        formattedDate = event.toDateString();
        return formattedDate;
    };

    self.extractShowtimeDates = function (showtimes) {
        // extract the date from the showtime
        showtimes.forEach(function (showtime) {
            var event = new Date(showtime.start_at);
            event = event.toDateString();
            
            // check if date is already in the showtimesDates array []
            var inShowtimeDates = self.vue.showtimeDates.indexOf(event);
            if (inShowtimeDates === -1) {
                // if array doesn't already have showtime
                self.vue.showtimeDates.push(event);
            }
        });
    };

    self.calendarShowtimeDates = function () {
        var event = new Date ();        
        for (i = 0; i < 7; i++) {
            var dateString = event.toDateString();
            self.vue.showtimeDates.push(dateString);
            event.setDate(event.getDate()+1);
        }
    }

    
    
    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            movies: [],
            cities: [],
            location: [],
            cinemas: [],
            showtimeDates: [],

            poll: {},
            pollShowtimes: [],
            pollMovies: [],

            logged_in: false,


            form_title: null,
            form_city: null,
            form_content: null,

            searching: false,
            selectedDate: new Date ().toDateString(),
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
            convertTime: self.convertTime,
            extractShowtimeDates: self.extractShowtimeDates,
            dateErrorHandle: self.dateErrorHandle,
        },
    });

    self.calendarShowtimeDates();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




