// This is the js for the default/index.html view.



var btn = document.getElementById("btn");

    Vue.config.silent = false; // show all warnings

        jQuery.ajax({
            url: "https://api.internationalshowtimes.com/v4/movies/",
            type: "GET",
            data: {
                "countries": "US",
            },
            headers: {
                "X-API-Key": "Y8YxMBHwe7EPYnIVnKgPYlznt4Yiap6u",
            },
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            $('#monitor_data').append(JSON.stringify(data));
            console.log(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
        })
        .always(function() {
        });



// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




