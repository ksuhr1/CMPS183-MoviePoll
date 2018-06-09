# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

db.define_table('poll',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('poll_content', 'text'),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_public', 'boolean', default=False),
                )

db.define_table('movie',
                Field('poll_id', 'reference poll'),	
                Field('title', 'text'),
                Field('vote', 'integer', default=0),
                )

db.movie.poll_id.requires = IS_IN_DB(db, db.poll.id)

# I don't want to display the user email by default in all forms.
db.poll.user_email.readable = db.poll.user_email.writable = False
db.poll.poll_content.requires = IS_NOT_EMPTY()
db.poll.created_on.readable = db.poll.created_on.writable = False
db.poll.updated_on.readable = db.poll.updated_on.writable = False
db.poll.is_public.readable = db.poll.is_public.writable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
