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

    self.getMovieLocation = function(movie_lat, movie_long) {
        self.vue.getMovieLocationUrl = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAJ1ZvhsklFbRlgcdg31NPxgvUysfXqxas&q="+movie_lat+","+movie_long;
        console.log("In getMovieLocation")};

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


    self.shareFacebookUrl = function(movie_poll_id){
            self.vue.shareFacebookUrl = "https://www.facebook.com/sharer/sharer.php?u=http%3A//127.0.0.1%3A8000/cs183moviepoll/default/results/"+movie_poll_id;
    };


    self.getMovieLocation = function(movie_lat, movie_long) {
        self.vue.getMovieLocationUrl = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAJ1ZvhsklFbRlgcdg31NPxgvUysfXqxas&q="+movie_lat+","+movie_long;
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

    self.get_more = function () {
        var num_polls = self.vue.polls.length;
        $.getJSON(get_polls_url(num_polls, num_polls + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.polls, data.polls);
        });
    };



    // ##############################################################
    // Add poll
    self.add_poll_button = function () {
        // The button to add a track has been pressed.
        if(self.vue.logged_in)
          self.vue.is_adding_poll = !self.vue.is_adding_poll;
    };

    self.add_poll = function () {
        // The submit button to add a track has been added.
        $.ajax({
            type: 'POST',
            url: add_poll_url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({content: self.vue.form_content, movies: self.vue.movies,}),
            dataType: 'json',
            success: function (data) {
                alert('Data sent');
            }
        });
    };



    // ##############################################################
    // Edit poll
    self.edit_poll_submit = function (poll_id) {
        poll = self.vue.polls.find(poll => poll.id === poll_id);
        poll.content = self.vue.edit_content;
        $.post(edit_poll_url,
            {
                poll_content: self.vue.edit_content,
                id: self.vue.edit_id
            },
            function (data) {
                $.web2py.enableElement($("#edit_poll_submit"));
                self.vue.editing = !self.vue.editing; 
            });
    };

    self.edit_poll = function(poll_id) {
        self.vue.editing = !self.vue.editing;
        self.vue.edit_id = poll_id;
        poll = self.vue.polls.find(poll => poll.id === poll_id);
        self.vue.edit_content = poll.content;
    };

    self.cancel_edit = function () {
        self.vue.editing = !self.vue.editing;
        self.vue.edit_id = 0;
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
    // Toggle poll

    self.toggle_public = function(poll_id) {
        $.post(toggle_public_url,
            {
                poll_id: poll_id
            },
            function (data) {
                poll = self.vue.polls.find(poll => poll.id === poll_id);
                poll.is_public = data.poll.is_public;
            }
        )
    };





    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            polls: [],
            movies:[],
            poll:[],

            get_more: false,
            has_more: false,

            logged_in: false,

            editing: false,
            is_adding_poll: false,

            form_title: null,
            form_content: null,
            edit_content: null,
            edit_id: 0,
            movie_poll_id: 0,


            uberURL: null,
            getMovieLocationUrl: null

        },
        methods: {
            get_more: self.get_more,
            add_poll_button: self.add_poll_button,
            add_poll: self.add_poll,
            delete_poll: self.delete_poll,
            edit_poll: self.edit_poll,
            edit_poll_submit: self.edit_poll_submit,
            cancel_edit: self.cancel_edit,
            toggle_public: self.toggle_public,
            getUberURL: self.getUberURL,
            getMovieLocation: self.getMovieLocation,
            shareFacebookUrl: self.shareFacebookUrl,


        }
    });

    self.get_polls();
    self.getUberURL();
    self.getMovieLocation(33.719944,-117.809505);
    self.shareFacebookUrl(2);

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




