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


    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};


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
        $.getJSON(search_movies_url,
            {
                movie: "",
                form_title: self.vue.form_title,
            },
            function (data) {
                jsonData = JSON.parse(data.response_content);
                console.log(jsonData);
                self.vue.movies= jsonData.movies;

                //Goes through the list of movies and gets the id
                for(var i in self.vue.movies){
                    var key = i;
                    var movie_id = self.vue.movies[i].id;
                    console.log(movie_id);
                }

                self.vue.get_cities(movie_id);


            }
        )

    };


    self.get_cities = function (movie_id) {
        console.log("In method get_cities");
       // console.log(form_city);
        $.getJSON(get_cities_url,
            {
                form_city: self.vue.form_city,
                movie_id:movie_id,

            },
            function (data) {
                jsonData = JSON.parse(data.response_city);
                console.log(jsonData);
                self.vue.cities= jsonData.cities;

                //Gets lat and lon of city
                //might need to add error check for city like if they type
                //'se' all cities with that beginning name pop up
                var lat = self.vue.cities[0].lat;
                var lon = self.vue.cities[0].lon;
                var location = lat +','+lon;
                self.vue.get_showtimes(movie_id, location);
            }
        )

    };



    self.get_showtimes = function (movie_id,location) {
        console.log("in get showtimes");
        $.getJSON(get_showtimes_url,
            {
                movie_id:movie_id,
                location:location,

            },
            function (data) {
                jsonData = JSON.parse(data.response_showtimes);
                self.vue.showtimes= jsonData.showtimes;
                console.log(self.vue.showtimes);

                 //Goes through the list of movies and gets the id
                for(var i in self.vue.showtimes){
                    var cinema_id = self.vue.showtimes[i].cinema_id;
                    //console.log(cinema_id);

                }
                self.vue.get_cinemas(cinema_id,location);
            }
        )
    };

    self.get_cinemas = function (cinema_id,location) {
        console.log("in get_cinemas");
        $.getJSON(get_cinemas_url,
            {
                cinema_id:cinema_id,
                location:location,

            },
            function (data) {
                jsonData = JSON.parse(data.response_cinemas);
                self.vue.cinemas= jsonData.cinemas;
                console.log(self.vue.cinemas);
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
            cities:[
                {lat:"",lon:""},
            ],
            showtimes:[],
            location:[],
            cinemas:[],

            poll: {},
            poll_movies: [],

            logged_in: false,

            movie_id:null,
            lat:null,
            lon:null,
            form_title: null,
            form_city:null,
            form_content: null,

        },
        methods: {
            add_poll: self.add_poll,
            add_movie: self.add_movie,
            search_movies: self.search_movies,
            get_cities: self.get_cities,
            get_showtimes:self.get_showtimes,
            get_cinemas:self.get_cinemas,
        }


    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




