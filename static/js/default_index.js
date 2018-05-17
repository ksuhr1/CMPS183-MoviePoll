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





    function get_posts_url(start_idx, end_idx) {
        console.log("I am in the get posts url method");
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return posts_url + "?" + $.param(pp);
    }

    self.get_posts = function () {
        console.log("I am in the get posts method");
        var post_len = self.vue.posts.length;
        $.getJSON(get_posts_url(post_len, post_len+4), function (data) {
            console.log(data);
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };

    self.get_more = function () {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_posts_url(num_posts, num_posts + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
        });
    };




    self.add_post_button = function () {
        // The button to add a track has been pressed.
        if(self.vue.logged_in)
          self.vue.is_adding_post = !self.vue.is_adding_post;
    };

    self.add_post = function () {
        // The submit button to add a track has been added.
        $.post(add_post_url,
            {
                content: self.vue.form_content,
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.posts.unshift(data.post);
                console.log(self.vue.posts.length);
                // if posts length is greater than 4 has_more is true
                if (self.vue.posts.length > 4) {
                    self.vue.has_more = true;
                }
                self.vue.is_adding_post = !self.vue.is_adding_post;
                self.vue.form_content = "";
            });
    };




    self.edit_post_submit = function (post_id) {
        post = self.vue.posts.find(post => post.id === post_id);
        post.content = self.vue.edit_content;
        $.post(edit_post_url,
            {
                post_content: self.vue.edit_content,
                id: self.vue.edit_id
            },
            function (data) {
                $.web2py.enableElement($("#edit_post_submit"));
                self.vue.editing = !self.vue.editing;
            });
    };

    self.edit_post = function(post_id) {
        self.vue.editing = !self.vue.editing;
        self.vue.edit_id = post_id;
        post = self.vue.posts.find(post => post.id === post_id);
        self.vue.edit_content = post.content;
    };

    self.cancel_edit = function () {
        self.vue.editing = !self.vue.editing;
        self.vue.edit_id = 0;
    };




    self.delete_post = function(post_id) {
        $.post(del_post_url,
            {
                post_id: post_id
            },
            function () {
                postIndex = self.vue.posts.findIndex(post => post.id === post_id);
                self.vue.posts.splice(postIndex, 1);
            }
        )
    };




    self.toggle_public = function(post_id) {
        $.post(toggle_public_url,
            {
                post_id: post_id
            },
            function (data) {
                post = self.vue.posts.find(post => post.id === post_id);
                post.is_public = data.post.is_public;
            }
        )
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            posts: [],
            get_more: false,
            has_more: false,
            
            logged_in: false,
            
            editing: false,
            is_adding_post: false,

            form_content: null,
            edit_content: null,
            edit_id: 0,
        },
        methods: {
            get_more: self.get_more,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            delete_post: self.delete_post,
            edit_post: self.edit_post,
            edit_post_submit: self.edit_post_submit,
            cancel_edit: self.cancel_edit,
            toggle_public: self.toggle_public,
        }


    });

    self.get_posts();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});




