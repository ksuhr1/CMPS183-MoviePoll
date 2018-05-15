# These are the controllers for your ajax api.


def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])


def get_posts():
    """This controller is used to get the posts.  Follow what we did in lecture 10, to ensure
    that the first time, we get 4 posts max, and each time the "load more" button is pressed,
    we load at most 4 more posts."""
    # Implement me!
    print "Made it to the get posts api"
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    # We just generate a lot of of data.
    posts = []
    has_more = False

    rows = db().select(db.post.ALL, orderby=~db.post.created_on, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        #print r
        name = get_user_name_from_email(r.user_email)
        if i < end_idx - start_idx:
            t = dict(
                id=r.id,
                user_email=r.user_email,
                content=r.post_content,
                created_on=r.created_on,
                updated_on=r.updated_on,
                first_name=name[0],
                last_name=name[1]


            )
            posts.append(t)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    return response.json(dict(
        posts=posts,
        logged_in=logged_in,
        has_more=has_more,
    ))


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
    """Here you get a new post and add it.  Return what you want."""
    # Implement me!
    user_email = auth.user.email or None
    p_id = db.post.insert(post_content=request.vars.content)
    p = db.post(p_id)
    name = get_user_name_from_email(p.user_email)
    post = dict(
            id=p.id,
            user_email=p.user_email,
            content=p.post_content,
            created_on=p.created_on,
            updated_on=p.updated_on,
            first_name=name[0],
            last_name=name[1]

    )
    print p
    return response.json(dict(post=post))


@auth.requires_signature()
def toggle_public():
    if auth.user == None:
        return "Not Authorized"

    q = ((db.memos.user_email == auth.user.email) &
         (db.memos.id == request.vars.memo_id))

    memo = db(q).select().first()

    if memo is None:
        return "Not Authorized"
    else:
        if (memo.is_public):
            memo.update_record(is_public=False)
        else:
            memo.update_record(is_public=True)

    return "toggle_public"

@auth.requires_signature()
def edit_post():
    post = db(db.post.id == request.vars.id).select().first()
    post.update_record(post_content=request.vars.post_content)

    print post
    return dict()


@auth.requires_signature()
def del_post():
    """Used to delete a post."""
    # Implement me!
    db(db.post.id == request.vars.post_id).delete()
    return "ok"

