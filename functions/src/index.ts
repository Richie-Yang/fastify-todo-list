import * as functions from 'firebase-functions';
import { fastify, requestHandle } from './fastify';

fastify.addContentTypeParser('application/json', {}, (req, body, done) => {
  done(null, body);
});

fastify.get('/', (req, reply) => {
  reply.send({ hello: 'world' });
});

export const todoList = functions.https.onRequest((req, res) => {
  fastify.ready((err) => {
    if (err) throw err;
    requestHandle(req, res);
  });
});
