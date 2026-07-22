import fastifyMongodb from "@fastify/mongodb";
import Fastify from "fastify";
import type { FastifyRequest, FastifyReply, FastifyInstance } from "Fastify";
import dbConnector from './db-connector.ts';
import { addItemsToDB, readItemsFromDB } from './db-calls.ts';

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.get("/", async function handler(req, res) {
  return { msg: "Hello World" };
});

// can be a more common approach.
fastify.get("/health", {
  handler: (req: FastifyRequest, res: FastifyReply) => {
    return { status: "OK" };
  },
});

fastify.post("/api/users", {
  handler: async (req: FastifyRequest, res: FastifyReply) => {
    return res.code(201).send("User Created");
  },
});

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

// adding schema for JSON validation of req body

const schema = {
  body: {
    type: "object",
    required: ["name"], // Optional: makes name field required
    properties: {
      name: { type: "string" },
      age: { type: "number" },
    },
  },
};

const opts = { schema };

fastify.post(
  "/api/users/2",
  opts,
  async (
    req: FastifyRequest<{
      Body: {
        name: string;
        age: number;
      };
    }>,
    res: FastifyReply,
  ) => {
    const body = req.body; // now on hovering on req.body, we see name and age.
    console.log(body);
    return res.code(201).send("User Created");
  },
);

// plugins
// most common plugin in fastify is grouping for the routes.

const userRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/1", {
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

  const schema = {
    body: {
      type: "object",
      required: ["name"], // Optional: makes name field required
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
    },
  };

  const opts = { schema };

  fastify.post(
    "/2",
    opts,
    async (
      req: FastifyRequest<{
        Body: {
          name: string;
          age: number;
        };
      }>,
      res: FastifyReply,
    ) => {
      const body = req.body; // now on hovering on req.body, we see name and age.
      console.log(body);
      return res.code(201).send("User Created");
    },
  );

  fastify.log.info("User Routes Registered");
};

// registering the plugin
fastify.register(userRoutes, {
  prefix: "/api/customers",
});

// writing a plugin for connection to mongo db
const dbConnector_ = async (fastify: FastifyInstance) => {
  // Fastify instance is provided, in case we are in another file.
  
  // ignore the error, just a typescript error.
  fastify.register(fastifyMongodb, {
    url: "mongodb://localhost:27017/fastify-db",
  });

  fastify.log.info("Connected to database");
};

//registering the dbConnector Plugin
fastify.register(dbConnector);

//db calls
fastify.get('/db/add', async (req: FastifyRequest, res: FastifyReply) => {
  return await addItemsToDB(fastify)(req, res);
});

fastify.get('/db/get', async (req: FastifyRequest, res: FastifyReply) => {
  return await readItemsFromDB(fastify)(req, res);
});

async function main() {
  await fastify.listen({
    port: 3000,
  });
}

main();
