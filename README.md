# fastify
learning

fastify has some logging out of the box for us.


The 415 Unsupported Media Type error happens when you send an HTTP POST, PUT, or PATCH request with a Content-Type header that Fastify doesn't know how to parse by default.
    Set Content-type: application/json,

    if no request body to be passed pass empty {}.
    else we will get 400 Bad Request, 
        because parser expects a valid req body but we passed none.


fastify.post("/api/users/1", {
  handler: async (
    req: FastifyRequest<{
      Body: {
        name: string;
        age: number;
      };
    }>,
    res: FastifyReply,
  ) => {
    const body = req.body; // now on hovering on req.body, we see name and age.
    return res.code(201).send("User Created");
  },
});

This is **TypeScript syntax** used in Fastify to define a route handler with **type safety** for the incoming request body.

Here is the exact breakdown of what each part does:

---

### 1. `handler: async (...) => {`

* **`handler:`** This is a key in a Fastify route options object (e.g., when passing route options to `fastify.route(...)`).
* **`async (...) => {`**: Defines an asynchronous ES Module arrow function.

---

### 2. `req: FastifyRequest<{ Body: { name: string; age: number; } }>`

This is where the TypeScript magic happens.

* **`req:`**: The parameter name for Fastify's Request object.
* **`FastifyRequest`**: A generic interface provided by Fastify to type-check requests.
* **`<{ Body: { ... } }>`**: A TypeScript **Generic Parameter**. You are telling Fastify:
> *"Hey, this request is going to have a `req.body` object, and it MUST contain a `name` (string) and an `age` (number)."*



Because of this typing, inside your function body:

* `req.body.name` will be automatically typed as a `string`.
* `req.body.age` will be automatically typed as a `number`.
* TypeScript will throw a compile-time error if you try to access an invalid property like `req.body.address`.

---

### 3. `res: FastifyReply`

* **`res:`**: The parameter name for Fastify's Reply object (often named `reply`).
* **`FastifyReply`**: The built-in Fastify type that gives you autocomplete and type-checking for reply methods like `res.status(200)`, `res.send(...)`, or `res.header(...)`.

---

### How it looks in context

Here is how this snippet fits into a full Fastify route in TypeScript:

```typescript
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';

const fastify = Fastify();

fastify.route({
  method: 'POST',
  url: '/user',
  handler: async (
    req: FastifyRequest<{
      Body: {
        name: string;
        age: number;
      };
    }>,
    res: FastifyReply
  ) => {
    // req.body is strongly typed!
    const { name, age } = req.body; 

    return res.status(201).send({
      message: `User ${name} created, age ${age}.`
    });
  }
});

```

> **Note:** While TypeScript checks this during development, remember to also use Fastify's JSON Schema validation (e.g., `schema: { body: ... }`) if you want runtime validation for incoming HTTP data!



fastify.register(userRoutes, {
  prefix: '/api/customers'
})

this is how we can group our routes based on a prefix.

There are large number of plugins, that we can add in our fastify server.
@fastify/compress
Fastify compression utils.

@fastify/cookie
Parse and set cookie headers.

@fastify/cors
Enables the use of CORS in a Fastify application.

and so on https://fastify.dev/ecosystem/

Mongo Express UI => http://localhost:8081/



const dbConnector = async(fastify: FastifyInstance) => {

  // Fastify instance is provided, in case we are in another file.



  fastify.register(fastifyMongodb, {

    url: "mongodb://localhost:27017/fastify-db"

  });



Fastify, plugins created with async need to register and await child plugins using fastify.register(), or use Fastify's plugin helper fp (fastify-plugin).

If you register this plugin without fastify-plugin, Fastify's strict encapsulation mechanism won't make fastify.mongo available outside this dbConnector function.


import fp from 'fastify-plugin';

// Wrap with fp to share fastify.mongo globally across the app
export default fp(dbConnector);