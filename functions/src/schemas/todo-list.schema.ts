import S from 'fluent-json-schema';

export { todoListBodySchema, postTodoListSchema, patchTodoListSchema };

const todoListBodySchema = S.object()
  .prop('title', S.string())
  .prop('description', S.string())
  .prop('createdBy', S.string())
  .additionalProperties(false);

const postTodoListSchema = {
  body: {
    ...todoListBodySchema.required(['title', 'createdBy']),
  },
};

const patchTodoListSchema = {
  body: postTodoListSchema,
};
