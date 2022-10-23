import * as functions from 'firebase-functions';
import { fastify, requestHandle } from './fastify';
import { todoController } from './controllers';

fastify.addContentTypeParser('application/json', {}, (req, body: any, done) => {
  done(null, body.body);
});

fastify.register(todoController, { prefix: '/todo' });
// fastify.register(todoController, {  })

export const todoList = functions.https.onRequest((req, res) => {
  fastify.ready((err) => {
    if (err) throw err;
    requestHandle(req, res);
  });
});
