import type {
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { type FastifyInstance } from "fastify";

export const addItemsToDB = (fastify: FastifyInstance) => {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const db = fastify.mongo.db;
    if (!db) {
      return res.status(500).send({ error: "Database not initialized" });
    }
    const collection = db.collection("test_items");
    const result = await collection.insertOne({
      name: "Test Item",
      createdAt: new Date(),
    });

    return res.code(201).send({
      message: "Document inserted successfully!",
      insertedId: result.insertedId,
    });
  };
};

export const readItemsFromDB = (fastify: FastifyInstance) => {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const db = fastify.mongo.db;
    if (!db) {
      return res.status(500).send({ error: "Database not initialized" });
    }
    const collection = db.collection("test_items");
    const items = await collection.find().toArray();

    return res.send({ count: items.length, items });
  };
};
