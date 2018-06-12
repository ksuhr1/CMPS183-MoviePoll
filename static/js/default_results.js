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
    

    // ##############################################################
    // Get single poll based on poll id
    self.get_poll = function (pollId) {
        console.log("getting single poll with id: " + pollId)
        $.getJSON(poll_url,
            {
                poll_id: pollId,
            },
            function (data) {
                console.log("here is your poll: ");
                console.log(data);
                self.vue.poll = data.poll;
                self.vue.logged_in = data.logged_in;


                var movies = self.vue.poll.movies;
                movies.forEach(function (movie) {
                    self.getShowtimes(movie);
                    self.getMoviesFromIstApi(movie, function (data) {
                        var mov = data.movie;
                        var img = mov.poster_image_thumbnail;
                        Vue.set(movie, 'poster_image_thumbnail', img);
                    });
                })

                if (!self.vue.pollActive) {
                    winningMovie();
                }

            }
        )
    };



    // ##############################################################
    // get showtimes
    self.getShowtimes = function (movie) {
        $.getJSON(showtimes_url,
            {
                movie_id: movie.id,
            },
            function (data) {
                // set new properties so that vue will track them
                Vue.set(movie, 'showtimes', data.showtimes);
                Vue.set(movie, 'cinemas', []);

                movie.showtimes.forEach(function (showtime) {
                    self.getShowtimeFromIstApi(showtime, function (data) {
                        // data has a showtime, cinema, and movie
                        var st = data.showtime;
                        var cin = data.cinema;
                        var normTime = self.convertTime(st.start_at);
                        var normDate = self.convertDate(st.start_at);
                        Vue.set(showtime, 'time', normTime);
                        Vue.set(showtime, 'date', normDate);
                        Vue.set(showtime, 'cinema_id', st.cinema_id);
                        Vue.set(showtime, 'cinema', cin.name);

                        // add cinema to the movie.cinemas array
                        if (!(movie.cinemas.find( cinema => cinema.id === data.cinema.id))) {
                            movie.cinemas.push(data.cinema);
                        }
                    });
                });
            }
        );
    };
    
    // get the full showtime data from international showtimes api
    self.getShowtimeFromIstApi = function (showtime, callback) {
        $.getJSON(get_one_showtime_ist_url,
            {
                showtime_id: showtime.ist_api_id,
            },
            function (data) {
                var jsonData = JSON.parse(data.response_content);
                callback(jsonData);
            }
        );
    };

    // get the full movie data from international showtimes api
    self.getMoviesFromIstApi = function (movie, callback) {
        $.getJSON(get_one_movie_ist_url,
            {
                movie_id: movie.ist_api_id,
            },
            function (data) {
                var jsonData = JSON.parse(data.response_content);                
                callback(jsonData);
            }
        );
    };



    // ##############################################################
    // Determine winning movie
    function winningMovie() {
        console.log("determining winning movie");
        var winningMovie = self.vue.poll.movies[0];
        self.vue.poll.movies.forEach(function (movie) {            
            if (movie.votes > winningMovie.votes) {
                winningMovie = movie;
            }
        })
        self.vue.winningMovie = winningMovie;
    }



    // ##############################################################
    // Get Uber url
    self.getUberURL = function () {
        var pp = {
            client_id: "<CLIENT_ID>",
            action: "setPickup",
            
            pickup: "my_location",
            
            dropoff: {
                latitude: 37.802374,
                longitude: -122.405818,
                nickname: "Coit Tower",
            },            

            product_id: "a1111c8c-c720-46c3-8534-2fcdd730040d",
        }
        self.vue.uberURL = "https://m.uber.com/ul/" + "?" + $.param(pp);
    }


    // ##############################################################
    // time stuff
    self.convertTime = function (isoDate) {
        var formattedTime;
        var event = new Date(isoDate);
        var options = { hour: 'numeric', minute: 'numeric' };
        formattedTime = event.toLocaleTimeString('en-US', options);
        return formattedTime;
    };

    self.convertDate = function (isoDate) {
        var formattedDate;
        var event = new Date(isoDate);
        formattedDate = event.toDateString();
        return formattedDate;
    };




    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            poll: {},
            polls: [],


            uberURL: null,

            winningMovie: {},
            pollActive: true,
        },
        methods: {
            get_poll: self.get_poll,
            getShowtimes: self.getShowtimes,
            getUberURL: self.getUberURL,            
        }


    });

    // self.get_polls();
    self.get_poll(poll_id);
    self.getUberURL();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




