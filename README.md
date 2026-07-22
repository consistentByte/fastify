# fastify
learning

fastify has some logging out of the box for us.


The 415 Unsupported Media Type error happens when you send an HTTP POST, PUT, or PATCH request with a Content-Type header that Fastify doesn't know how to parse by default.
    Set Content-type: application/json,

    if no request body to be passed pass empty {}.
    else we will get 400 Bad Request, 
        because parser expects a valid req body but we passed none.