// src/app/prerender-params.ts

import { Request } from 'express';

export function getPrerenderParams(route: string, req: Request): { [key: string]: any } {
  const params: { [key: string]: any } = {};

  if (route === '/playlist/:id') {
    params['id'] = req.params['id']; 
  } else if (route === '/song/:id') {
    params['id'] = req.params['id'];
  }

  return params;
}
