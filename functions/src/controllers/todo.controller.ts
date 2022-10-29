import { FastifyInstance } from 'fastify';
import { todoListRepository, todoRepository } from '../repositories';
import { postTodoSchema, patchTodoSchema } from '../schemas';
import { Todo } from '../types';
import { ERROR } from '../messages';

export async function todoController(
  fastify: FastifyInstance,
  options: Object
) {
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const foundTodo = await todoRepository().findById(id);
    return reply.send(foundTodo);
  });

  fastify.get('/', async (req, reply) => {
    const allTodo = await todoRepository().findWhole();
    return reply.send(allTodo);
  });

  fastify.post('/', { schema: postTodoSchema }, async (req, reply) => {
    const { todoListId } = req.body as Todo;
    const todoList = await todoListRepository().findById(todoListId);
    if (!todoList) throw new Error(ERROR.TODO_LIST.NOT_FOUND);
    const createdTodo = await todoRepository().create(req.body as any);
    return reply.send(createdTodo);
  });

  fastify.patch('/:id', { schema: patchTodoSchema }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const updatedTodo = await todoRepository().update(id, req.body as any);
    return reply.send(updatedTodo);
  });

  fastify.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const deletedTodo = await todoRepository().hardDelete(id);
    return reply.send(deletedTodo);
  });
}
