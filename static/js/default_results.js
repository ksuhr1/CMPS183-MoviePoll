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
        })
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

                // // dummy votes data for testing 
                // self.vue.poll.movies.forEach(function (movie) {
                //     movie['votes'] = Math.floor(Math.random()*10);
                //     console.log(movie);
                // })

                var movies = self.vue.poll.movies;
                movies.forEach(function (movie) {
                    // self.get_showtimes(movie.id);
                    self.get_showtimes(movie);
                })

                if (!self.vue.pollActive) {
                    winningMovie();
                }

            }
        )
    };

    self.get_showtimes = function (movie) {
        console.log("movieId", movie);
        $.getJSON(showtimes_url,
            {
                movie_id: movie.id,
            },
            function (data) {
                console.log(data);
                Vue.set(movie, 'showtimes', data.showtimes);

                var count = movie.showtimes.length;
                movie.showtimes.forEach(function (showtime) {                
                    self.dataArray.push(showtime.votes);
                    self.showtimeArray.push(showtime.id);
                    console.log("count", count);
                    count--;
                    if (count === 0) {
                        self.createChart();
                    }
                });   
                console.log(self.showtimeArray);         
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
    }





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
            get_polls: self.get_polls,
            get_poll: self.get_poll,
            get_showtimes: self.get_showtimes,
            getUberURL: self.getUberURL,
        },
        mounted: function () {
          this.$nextTick(function () {
            // self.createChart();
          })
        }


    });


    self.dataArray = [];
    colorsarray = [];
    copyarray = [];
    self.showtimeArray = [];
    
    function getRandomColor () {
        var len = self.showtimeArray.length
        var letters = '0123456789ABCDEF';
        colarray = [];
        for(var shows = 0; shows<40; shows++){
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            colarray[shows] = color
        }
        return colarray;
    }                                   
        
 
    self.createChart = function () {
        console.log("in createChart");
        var ctx = document.getElementById('myChart').getContext('2d');
        var myDoughnutChart = new Chart(ctx, {
            //colorsarray: getRandomColor(),
            //The type of chart we want to create
            type: 'doughnut',

            // The data for our dataset
            data: {
                labels: self.showtimeArray,
                datasets: [{
                    
                    backgroundColor: getRandomColor(), 
                    data: self.dataArray
                }]
            },

            // Configuration options go here
            options: {}

        });
    }


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




