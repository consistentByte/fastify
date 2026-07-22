import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import fastifyMongodb from '@fastify/mongodb';

export const dbConnector = async (fastify: FastifyInstance) => {
  await fastify.register(fastifyMongodb, {
    url: 'mongodb://admin:password@localhost:27017/fastify-db?authSource=admin',
  });

  fastify.log.info('Connected to database');
};

// Wrap with fp so fastify.mongo breaks out of encapsulation
export default fp(dbConnector);