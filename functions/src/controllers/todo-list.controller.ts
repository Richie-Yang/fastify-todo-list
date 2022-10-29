import { FastifyInstance } from 'fastify';
import { todoListRepository, todoRepository } from '../repositories';
import { postTodoListSchema, patchTodoListSchema } from '../schemas';

export async function todoListController(
  fastify: FastifyInstance,
  options: Object
) {
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const foundTodoList = await todoListRepository().findById(id);
    if (foundTodoList) {
      const todos = await todoRepository().findWhole(['todoListId', '==', id]);
      foundTodoList.todos = todos;
    }
    return reply.send(foundTodoList);
  });

  fastify.get('/', async (req, reply) => {
    const allTodoLists = await todoListRepository().findWhole();
    return reply.send(allTodoLists);
  });

  fastify.get('/count', async (req, reply) => {
    const allTodoLists = await todoListRepository().findWhole();
    const count = allTodoLists.reduce((_1, _2, index) => index + 1, 0);
    return reply.send(count);
  });

  fastify.post('/', { schema: postTodoListSchema }, async (req, reply) => {
    const createdTodoList = await todoListRepository().create(req.body as any);
    return reply.send(createdTodoList);
  });

  fastify.patch('/:id', { schema: patchTodoListSchema }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const updatedTodo = await todoListRepository().update(id, req.body as any);
    return reply.send(updatedTodo);
  });

  fastify.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [deletedTodoList, todos] = await Promise.all([
      todoListRepository().hardDelete(id),
      todoRepository().findWhole(['todoListId', '==', id]),
    ]);
    await Promise.all(
      todos.map((todo) => todoRepository().hardDelete(todo.id))
    );
    return reply.send(deletedTodoList);
  });
}
