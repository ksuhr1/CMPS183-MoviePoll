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


    self.copyURL = function(poll_id) {
        self.vue.copyURL = "http://127.0.0.1:8000/cs183moviepoll/default/results/" + poll_id;
    }


    self.shareFacebookURL = function(poll_id) {
            self.vue.shareFacebookURL = "https://www.facebook.com/sharer/sharer.php?u=http%3A//127.0.0.1%3A8000/cs183moviepoll/default/results/"+poll_id;
    };

    self.getMovieLocation = function(movie_lat, movie_long) {
        self.vue.getMovieLocationUrl = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAJ1ZvhsklFbRlgcdg31NPxgvUysfXqxas&q="+movie_lat+","+movie_long;
        console.log("In getMovieLocation")};


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
        console.log("getting single poll with id: " + pollId)
        $.getJSON(poll_url,
            {
                poll_id: poll_id,
            },
            function (data) {
                console.log("here is your poll: ");
                console.log(data);
                self.vue.poll = data.poll;
                self.vue.logged_in = data.logged_in;

                // // dummy votes data for testing 
                // self.vue.poll.movies.forEach(function (movie) {
                //     movie['votes'] = Math.floor(Math.random()*10);
                //     console.log(movie);
                // })


                self.vue.poll.movies.forEach(function (movie){
                    // movie['vote'] = movied;
                    console.log(movie);

                })

                if (!self.vue.pollActive) {
                    winningMovie();
                }

            }
        )
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
    };









    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            poll: {},
            polls: [],


            uberURL: null,
            getMovieLocationUrl: null,


            winningMovie: {},
            pollActive: true,

        },
        methods: {
            get_polls: self.get_polls,
            get_poll: self.get_poll,
            getUberURL: self.getUberURL,
            getMovieLocation: self.getMovieLocation,
            shareFacebookURL: self.shareFacebookURL,
            copyURL: self.copyURL,


        }


    });

    // self.get_polls();
    self.get_poll(poll_id);
    self.getMovieLocation(33.719944,-117.809505);
    self.getUberURL();
    self.shareFacebookURL(poll_id);
    self.copyURL(poll_id);



    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




