import dotenv from 'dotenv';

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  console.log('Loading environment variables...');
  dotenv.config();
  loaded = true;
}
