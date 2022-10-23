import { FastifyInstance } from 'fastify';
import { todoRepository } from '../repositories';

export async function todoController(
  fastify: FastifyInstance,
  options: Object
) {
  fastify.get('/', async (req, reply) => {
    const todo = todoRepository();
    const todos = await todo.findWhole();
    return reply.send(todos);
  });

  fastify.post('/', async (req, reply) => {
    const todo = todoRepository();
    const createdTodo = await todo.create(req.body);
    return reply.send(createdTodo);
  });
}
