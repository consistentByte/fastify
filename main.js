import Fastify from 'fastify';

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

async function main() {
    await fastify.listen({
        port: 3000,
    })
}

main();