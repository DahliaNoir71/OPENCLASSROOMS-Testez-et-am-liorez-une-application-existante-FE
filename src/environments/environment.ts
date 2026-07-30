// Environnement par défaut = build de PRODUCTION.
// apiUrl relatif ('') : le front et l'API doivent être servis sur la même
// origine (CORS désactivé côté back). Les appels partent alors en same-origin
// sur /api/... Ne pas mettre d'URL absolue cross-origin (casserait CORS + le
// matching /api/login de l'interceptor).
export const environment = {
  production: true,
  apiUrl: ''
};
