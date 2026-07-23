import Fastify from "fastify";

async function buildServer() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      },
    },
  });
  fastify.get("/", () => "welcome");

  return fastify;
}

// buildServer will be used to create instance of fastify server, and we can use buildServer for our tests as well.

// making it async as we need to register all sorts of plugins.
// if no plugins dont make it async then for simplicity.

async function main() {
  const fastify = await buildServer();

  fastify.listen({
    port: 3000,
  });
}

async function test() {
  const server = await buildServer();
  const response = await server.inject({
    method: "GET",
    url: "/",
  });

  console.log("status: ", response.statusCode);
  console.log("body: ", response.body);
}

test();
