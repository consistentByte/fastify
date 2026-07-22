import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply } from 'Fastify';

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    }
});

fastify.get('/', async function handler (req, res) {
    return {msg: 'Hello World'}
})

// can be a more common approach.
fastify.get('/health', {
    handler: (req: FastifyRequest, res: FastifyReply) => {
        return {status: 'OK'};
    }
})

fastify.post('/api/users', {
    handler: async (req: FastifyRequest, res: FastifyReply) => {
        return res.code(201).send('User Created');
    }
})

async function main() {
    await fastify.listen({
        port: 3000,
    })
}

main();