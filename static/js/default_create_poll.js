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
    // Add poll
    self.add_poll = function () {
        // The submit button to add a track has been added.
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
    //Add movies to array
    self.add_movie = function () {
        // The submit button to add a track has been added.
        var movie = {
            title: self.vue.form_title
        };

        self.vue.poll_movies.push(movie);

    };


    self.search_movies2 = function () {
        console.log(self.vue.form_title);
        //get_show_times();
        $.getJSON(search_movies_url,
            {
                movie: "",
                title: self.vue.form_title,
            },
            function (data) {
                jsonData = JSON.parse(data.response_content);
                console.log(jsonData);
                self.vue.movies= jsonData.movies;
            }
        )
    };



    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            movies:[
                {title: "dummy data movie"},
            ],
            poll: {},
            poll_movies: [],

            logged_in: false,

            form_title: null,
            form_content: null,

        },
        methods: {
            add_poll: self.add_poll,
            add_movie: self.add_movie,
            search_movies2: self.search_movies2,
        }


    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




