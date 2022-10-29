import S from 'fluent-json-schema';
import { TODO_STATUS } from '../variables';

export { todoBodySchema, postTodoSchema, patchTodoSchema };

const todoBodySchema = S.object()
  .prop('todoListId', S.string())
  .prop('title', S.string())
  .prop('detail', S.string())
  .prop('status', S.enum(Object.values(TODO_STATUS)))
  .prop('createdBy', S.string())
  .additionalProperties(false);

const postTodoSchema = {
  body: {
    ...todoBodySchema.required(['todoListId', 'title', 'status', 'createdBy']),
  },
};

const patchTodoSchema = {
  body: todoBodySchema,
};
