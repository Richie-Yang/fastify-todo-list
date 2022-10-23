import * as http from 'http';
import { FastifyServerFactory } from 'fastify';

export type Handler = (
  request: http.IncomingMessage,
  response: http.ServerResponse<http.IncomingMessage> &
    http.ServerResponse<http.IncomingMessage>
) => void;

export type ServerFactory = FastifyServerFactory<
  http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
>;
