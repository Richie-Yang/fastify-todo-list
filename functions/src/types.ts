import * as http from 'http';
import { FastifyServerFactory } from 'fastify';
import { firestore } from 'firebase-admin';
import { TODO_STATUS } from './variables';

export type Handler = (
  request: http.IncomingMessage,
  response: http.ServerResponse<http.IncomingMessage> &
    http.ServerResponse<http.IncomingMessage>
) => void;

export type ServerFactory = FastifyServerFactory<
  http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
>;

export type WhereQuery = [
  fieldPath: string | firestore.FieldPath,
  opStr: firestore.WhereFilterOp,
  value: any
];

export type OrderQuery = [
  fieldPath: string | firestore.FieldPath,
  directionStr?: firestore.OrderByDirection | undefined
];

export type FilterQuery = {
  size: number;
  page: number;
  order: OrderQuery | OrderQuery[];
  where: WhereQuery | WhereQuery[] | null;
};

export type CollectionRef =
  firestore.CollectionReference<firestore.DocumentData>;
export type QueryRef = firestore.Query<firestore.DocumentData>;

export type TodoList = {
  title: string;
  description?: string;
  status: TODO_STATUS;
  createdBy: string;
};

export type Todo = {
  todoListId: string;
  title: string;
  detail?: string;
  createdBy: string;
};
