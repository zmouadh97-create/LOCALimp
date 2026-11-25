// Limite augmentée pour permettre l'envoi d'une photo (max 1 Mo) via Server Actions
export default { experimental: { serverActions: { bodySizeLimit: '2mb' } } };
