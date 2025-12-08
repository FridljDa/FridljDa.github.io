export function validateEnv(): void {
  const requiredVars = ['GEMINI_API_KEY'] as const;

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}

export function getEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

