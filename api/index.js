import('../dist/ng-cats/server/server.mjs')
  .then((module) => module.app)
  .catch((error) => {
    console.error('Failed to load server module:', error);
    throw error;
  });

export default async (req, res) => {
  const { reqHandler } = await import('../dist/ng-cats/server/server.mjs');
  return reqHandler(req, res);
};
