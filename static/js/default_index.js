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

            self.vue.polls.forEach(function (poll) {
                self.processPoll(poll);
            });      
        });
    };

    // not properly working because it doesn't process poll (iterate the movies)
    self.get_more = function () {
        var num_polls = self.vue.polls.length;
        $.getJSON(get_polls_url(num_polls, num_polls + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.polls, data.polls);
        });
    };

    self.processPoll = function (poll) {
        var movies = poll.movies;
        movies.forEach(function (movie) {
            self.getMoviesFromIstApi(movie, function (data) {
                var mov = data.movie;
                var img = mov.poster_image_thumbnail;
                Vue.set(movie, 'poster_image_thumbnail', img);
            });
        });        
    }


    // ##############################################################
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
    // Delete poll
    self.delete_poll = function(poll_id) {
        $.post(del_poll_url,
    
            {
                poll_id: poll_id
            },
            function () {
                pollIndex = self.vue.polls.findIndex(poll => poll.id === poll_id);
                self.vue.polls.splice(pollIndex, 1);
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

    self.convertDate = function (isoDate) {
        var formattedDate;
        var event = new Date(isoDate);
        formattedDate = event.toDateString();
        return formattedDate;
    };

    self.getUrl = function (poll) {
        var url = results_url + "/" + poll.id
        return url;
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            polls: [],
            movies:[],

            get_more: false,
            has_more: false,

            logged_in: false,

            editing: false,
            is_adding_poll: false,

            form_title: null,
            form_content: null,
            edit_content: null,
            edit_id: 0,
        },
        methods: {
            get_more: self.get_more,
            delete_poll: self.delete_poll,
            getUrl: self.getUrl
        }
    });

    self.get_polls();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




