# These are the controllers for your ajax api.

# returns the name (first and last) of the user as a string 
def get_name(email):
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])


def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0

    posts = []
    has_more = False

    if auth.user is not None:
        q = db((db.post.user_email == auth.user.email) | (db.post.is_public == True))
        rows = q.select(db.post.ALL, orderby=~db.post.created_on, limitby=(start_idx, end_idx + 1))
    else:         
        q = db(db.post.is_public == True)
        rows = q.select(db.post.ALL, orderby=~db.post.created_on, limitby=(start_idx, end_idx + 1))

    for i, r in enumerate(rows):
        name = get_name(r.user_email)
        if i < end_idx - start_idx:
            t = dict(
                id=r.id,
                user_email=r.user_email,
                content=r.post_content,
                created_on=r.created_on,
                updated_on=r.updated_on,
                is_public=r.is_public,
                name=name,
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
    user_email = auth.user.email or None
    p_id = db.post.insert(post_content=request.vars.content)
    p = db.post(p_id)
    name = get_name(p.user_email)
    post = dict(
            id=p.id,
            user_email=p.user_email,
            content=p.post_content,
            created_on=p.created_on,
            updated_on=p.updated_on,
            is_public=p.is_public,
            name=name,
    )
    return response.json(dict(post=post))


@auth.requires_signature()
def toggle_public():
    if auth.user == None:
        return "Not Authorized"

    q = ((db.post.user_email == auth.user.email) &
         (db.post.id == request.vars.post_id))

    post = db(q).select().first()

    if post is None:
        return "Not Authorized"
    else:
        if (post.is_public):
            post.update_record(is_public=False)
        else:
            post.update_record(is_public=True)
    # return post
    return response.json(dict(post=post))

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

