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
    

    self.sendVoteServer = function () {
        if (self.vue.voteCartShowtimes.length > 0) {
            $.ajax({
                type: 'POST',
                url: cast_vote_url,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(
                    {
                        showtimes: self.vue.voteCartShowtimes,
                        poll_id: poll_id,
                    }),
                dataType: 'json',
                success: function (data) {
                    console.log('Vote sent to server');
                    // redirect to the voting page
                    window.location = results_url + '/' + poll_id;
                },
                error: function (data) {
                    console.log(data);
                    alert("Something went wrong");
                }
            });
        } else {
            alert("Please select a showtime u d0wn fo");
        }
    };

    self.addToVoteCart = function (showtimeId) {
        var showtime = self.vue.poll.movies.find( movie => movie.id === movieId);
        var inCart = self.vue.voteCartShowtimes.indexOf(showtime);
        console.log("cart", inCart);
        //add to the cart
        if (inCart === -1) {
            self.vue.voteCartShowtimes.push(movie);
        //take out of cart
        } else {
            self.vue.voteCartShowtimes.splice(inCart, 1);
        }
        console.log(self.vue.cart);
    };


    self.addToVoteCart = function (movieId, showtimeId) {
        var movie = self.vue.poll.movies.find( movie => movie.id === movieId );
        var showtime = movie.showtimes.find( showtime => showtime.id === showtimeId );

        var indexShowtimeInCart = self.vue.voteCartShowtimes.indexOf(showtime);
        var indexMovieInCart = self.vue.voteCartMovies.indexOf(movie);


        if (indexShowtimeInCart === -1) { // if showtime not in cart
            self.vue.voteCartShowtimes.push(showtime); // add it in
            
            // if movie is not in cart, push the movie to pollMovies []
            if (indexMovieInCart === -1) {
                self.vue.voteCartMovies.push(movie);
            }
        } else {
            self.vue.voteCartShowtimes.splice(indexShowtimeInCart, 1);
            
            // if movie is in cart and none of the showtimes in the voteCartShowtimes [] has the movie
            // then remove it
            // var movieInShowtimes = self.vue.voteCartShowtimes.find( showtime => showtime.movie_id === movieId );            
            // if ((indexMovieInCart != -1) && !(movieInShowtimes)) {
            //     self.vue.voteCartMovies.splice(indexMovieInCart, 1);
            // }
        }
    };



    // ##############################################################
    // Get polls
    function get_polls_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return polls_url + "?" + $.param(pp);
    }

    self.get_polls = function () {
        var poll_len = self.vue.polls.length;
        $.getJSON(get_polls_url(poll_len, poll_len+4), function (data) {
            self.vue.polls = data.polls;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };



    // ##############################################################
    // Get single poll based on poll id
    self.get_poll = function (pollId) {
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
                    // self.getShowtimes(movie.id);
                    self.getShowtimes(movie);
                })
            }
        );
    };


    // ##############################################################
    // get showtimes
    self.getShowtimes = function (movie) {
        $.getJSON(showtimes_url,
            {
                movie_id: movie.id,
            },
            function (data) {
                Vue.set(movie, 'showtimes', data.showtimes);
                movie.showtimes.forEach(function (showtime) {
                    self.getShowtimeFromIstApi(showtime, function (data) {
                        var normTime = self.convertTime(data.showtime.start_at);
                        Vue.set(showtime, 'time', normTime);
                    });
                });
            }
        );
    };
    
    // get the full showtime data from international showtimes api
    self.getShowtimeFromIstApi = function (showtime, callback) {
        $.getJSON(get_showtime_ist_url,
            {
                showtime_id: showtime.ist_api_id,
            },
            function (data) {
                var jsonData = JSON.parse(data.response_content);                
                callback(jsonData);
            }
        );
    };


    // may not need later if we get the cinemas along with the showtime
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
    // time stuff
    self.convertTime = function (isoDate) {
        var formattedTime;
        var event = new Date(isoDate);
        var options = { hour: 'numeric', minute: 'numeric' };
        formattedTime = event.toLocaleTimeString('en-US', options);
        return formattedTime;
    };





    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            showtimes:[],
            cinemas:[],

            poll: {},
            polls: [],
            voteCartShowtimes: [],
            voteCartMovies: [],
            vote: 0,
        },
        methods: {
            get_polls: self.get_polls,
            get_poll: self.get_poll,
            sendVoteServer: self.sendVoteServer,
            addToVoteCart: self.addToVoteCart,
            getShowtimes:self.getShowtimes,
        }


    });

    self.getCinemas('37.0108489,-121.9862189');
    self.get_poll(poll_id);
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




