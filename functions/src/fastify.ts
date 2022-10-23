import Fastify from 'fastify';
import * as http from 'http';
import { Handler } from './types';

let handleRequest: Handler | null = null;
const serverFactory = (handler: Handler, opts: any) => {
  handleRequest = handler;
  return http.createServer();
};

export const fastify = Fastify({ serverFactory, logger: true });
export const requestHandle = handleRequest as unknown as Handler;
