import * as functions from 'firebase-functions';
import { fastify, requestHandle } from './fastify';
import { todoController, todoListController } from './controllers';

fastify.addContentTypeParser('application/json', {}, (req, body: any, done) => {
  done(null, body.body);
});

fastify.register(todoListController, { prefix: '/todo-list' });
fastify.register(todoController, { prefix: '/todo' });

export const todoList = functions.https.onRequest((req, res) => {
  fastify.ready((err) => {
    if (err) throw err;
    try {
      return requestHandle(req, res);
    } catch (e) {
      return res.sendStatus(500);
    }
  });
});
