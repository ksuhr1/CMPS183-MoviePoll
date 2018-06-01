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


    self.search_movies = function () {
        console.log(self.vue.form_title);
        $.ajax({
            url: "https://api.internationalshowtimes.com/v4/movies/",
            type: "GET",
            data: {
                "countries": "US",
                "limit": 20,
                "search_query":self.vue.form_title,
                "search_field":"title",

            },
            headers: {
                "X-API-Key": "Y8YxMBHwe7EPYnIVnKgPYlznt4Yiap6u",
            },
        })
        .done(function(data, textStatus, jqXHR) {
            console.log(jqXHR);
            $('#monitor_data').append(JSON.stringify(data));
            console.log(data);
            self.vue.movies = data.movies;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
        })
        .always(function() {
        });        
    }




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
            search_movies: self.search_movies,
        }


    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




