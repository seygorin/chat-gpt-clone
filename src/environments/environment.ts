import { envConfig } from './env.config';

export const environment = {
  production: false,
  geminiApiKey: envConfig.geminiApiKey,
  firebase: envConfig.firebase,
};
