import S from 'fluent-json-schema';

export const todoBodySchema = S.object()
  .prop('title', S.string().required())
  .prop('description', S.string())
  .prop('by', S.string().required());

export const getTodoSchema = {
  body: todoBodySchema,
};
