import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'stories/edit/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'series/edit/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
