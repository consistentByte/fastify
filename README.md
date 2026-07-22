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


Order of registering plugins is important.

[15:15:27.597] INFO (20204): User Routes Registered
[15:15:27.691] INFO (20204): Connected to database
[15:15:27.736] INFO (20204): Server listening at http://[::1]:3000
[15:15:27.738] INFO (20204): Server listening at http://127.0.0.1:3000
[15:15:35.705] INFO (20204): incoming request

On changing the order of registering plugins
[15:19:52.150] INFO (22472): Connected to database
[15:19:52.152] INFO (22472): User Routes Registered
[15:19:52.209] INFO (22472): Server listening at http://[::1]:3000
[15:19:52.210] INFO (22472): Server listening at http://127.0.0.1:3000



Decorators:
Adding hooks to fastify request:
  common use case, when a req comes, we want to decode jwt, and get the user and add it to req.

  If the handler of hook isn't async, it will be stuck on the Processing when we send the req,
  to prevent that make it async

  fastify.addHook('preHandler', async (req: FastifyRequest<{Body: {user: string}}>, res: FastifyReply) => {
    req.user = 'Saurabh Pandey';
  })

  This hook will add, user property to incoming req.

  If we do not want to make this function async, then accept third parameter => done,
  and write done()


  fastify.addHook('preHandler', (req: FastifyRequest<{Body: {user: string}}>, res: FastifyReply, done) => {
    req.user = 'Saurabh Pandey';
    done();
  })

  Flaw: We are mutating req obj there that means we will lose some optimizations that are made with request for us.
  To fix that:
    We tell fastify that mutate this object first before you apply your optimizations and then we can change the value later.

  We do that by, adding a decorator.

  fastify.addRequest("PropertyToBeAddedToRequest", "Default Value");

  This will work exactly the same, we will not lose any optimizations that we will have on request.

  If in hook we are updating req.user to be object, then put null as default in decorator.

    fastify.decorateRequest("user", null)
    fastify.addHook('preHandler', (req: FastifyRequest<{Body: {user: string}}>, res: FastifyReply, done) => {
        req.user = {
          name: "Saurabh pandey"
        };
        done();
    })


    While both approaches set `req.user`, the second pattern (using **`fastify.decorateRequest()`**) is the **official and recommended Fastify best practice**.

Here is why `decorateRequest` matters and the exact differences between the two:

---

### 1. V8 Engine Performance (Hidden Classes Optimization)

JavaScript engines like V8 optimize object access by assigning a fixed "shape" or **Hidden Class** to objects.

* **Without `decorateRequest`:** When you attach `req.user = ...` inside a hook, you are adding an unannounced property to `req` *after* the request object has already been instantiated. This mutates the shape of `req` at runtime, causing V8 to **de-optimize** property lookup (invalidating inline caches).
* **With `decorateRequest("user", null)`:** Fastify pre-defines the shape of all incoming `FastifyRequest` instances during boot. Every request object is instantiated with the `user` property already present on its prototype (initialized to `null`). V8 can maintain a single, static hidden class for the request object throughout its lifecycle, leading to better throughput.

---

### 2. Encapsulation & Dependency Guardrails

* **Without `decorateRequest`:** Fastify has no knowledge that `user` exists on the request object. If another route or plugin tries to access `req.user` before your `preHandler` hook executes, it fails silently with `undefined`.
* **With `decorateRequest`:** Fastify registers `user` into its internal encapsulation tree. You can also use runtime checks like `fastify.hasRequestDecorator('user')` or enforce plugin dependency checks with `fastify.getDecorator('user')` during app startup.

---

### 3. Prevention of Reference Leaks

Fastify enforces specific rules when using `decorateRequest`:

```typescript
// ❌ Fastify throws an error at startup if you try to pass an object reference:
fastify.decorateRequest('user', { name: '' }); 

```

Fastify explicitly prevents passing reference types directly to `decorateRequest` because that reference would be shared across **all** HTTP requests, leading to data leaks across users. Initializing with `null` or `""` (primitive types) ensures safety and forces you to set individual request payload values inside request-scoped hooks (like `onRequest` or `preHandler`).

---

### 4. TypeScript Best Practices

To make `req.user` fully type-safe across your entire application when using `decorateRequest`, augment Fastify’s internal module declaration rather than adding local generics on every route:

```typescript
import Fastify from 'fastify';

// 1. Declare custom request decoration for TypeScript
declare module 'fastify' {
  interface FastifyRequest {
    user: { name: string } | null;
  }
}

const fastify = Fastify();

// 2. Initialize decorator
fastify.decorateRequest('user', null);

// 3. Set value in hook
fastify.addHook('preHandler', async (req, reply) => {
  req.user = { name: 'Saurabh Pandey' }; // req.user is automatically typed!
});

```

---

### Summary

| Metric | Without `decorateRequest` | With `decorateRequest("user", null)` |
| --- | --- | --- |
| **V8 Hidden Class** | Mutated dynamically (De-optimized) | Static & Preserved (Optimized) |
| **Fastify Awareness** | Invisible to Fastify's core | Registered in Fastify's tree |
| **Data Safety** | Manual handling | Guards against reference-sharing leaks |
| **Recommended Usage** | Quick scripts / One-off prototypes | Production Fastify applications |


Not quite build-time or compile-time—it actually happens at **Server Startup (Runtime)**, but *before* any HTTP requests arrive.

In JavaScript, there is no true native compilation step (like in C++ or Rust) that bakes object structures at build time. Everything happens in memory when Node.js runs.

Here is what "static and preserved" actually means in this context:

---

### The Assembly Line Analogy

Think of Fastify's request object (`req`) as a car rolling off an assembly line every time a user hits your endpoint:

#### 1. Without `decorateRequest` (Dynamic / Mutated)

1. Server receives a request.
2. Fastify builds a basic `req` car object.
3. Your `preHandler` hook executes and suddenly welds a **roof rack** (`req.user`) onto that specific car.
4. **V8's Reaction:** *"Whoa, this car's layout just changed! I have to re-calculate where everything is located in memory for this specific object."* (Performance penalty).

#### 2. With `decorateRequest("user", null)` (Static / Preserved)

1. **At Server Boot (`fastify.listen`):** Fastify creates a single "mold" (V8 Hidden Class / Shape) for all future request objects. This mold explicitly includes a `user` slot set to `null`.
2. **When a request arrives:** Fastify stamps out a `req` object already containing the `user` property.
3. Your `preHandler` hook simply replaces `null` with `{ name: 'Saurabh' }`.
4. **V8's Reaction:** *"The shape of this object didn't change at all; only a value inside a pre-allocated slot changed. I can access this property blazingly fast!"*

---

### Clarifying the Timeline

| Timeline Phase | What Happens |
| --- | --- |
| **Build / Compile Time** <br>

<br>*(TypeScript / Babel)* | Types are checked and stripped. **No JavaScript runtime objects exist yet.** |
| **Server Startup** <br>

<br>*(Executing `decorateRequest`)* | Fastify defines the **static object shape/blueprint** in Node.js memory. |
| **Request Time** <br>

<br>*(Executing `preHandler`)* | Individual `req` objects are instantiated using that static blueprint and populated. |

So when we say "static," we mean the **structure/shape of the object remains fixed in V8's memory** throughout the request's lifecycle, rather than being modified on the fly!