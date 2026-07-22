import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "Fastify";

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

async function main() {
  await fastify.listen({
    port: 3000,
  });
}

main();
