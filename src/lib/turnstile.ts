import { env } from './env';

export interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  error_codes?: string[];
}

export interface TurnstileVerifyOptions {
  remoteIp?: string;
  action?: string;
}

export async function verifyToken(
  token: string,
  options: TurnstileVerifyOptions = {}
): Promise<TurnstileVerifyResponse> {
  const secretKey = env.TURNSTILE_SECRET_KEY;
  const siteKey = env.TURNSTILE_SITE_KEY;

  if (!secretKey) {
    return {
      success: false,
      error_codes: ['missing-secret-key'],
    };
  }

  if (!token) {
    return {
      success: false,
      error_codes: ['missing-token'],
    };
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (options.remoteIp) {
      formData.append('remoteip', options.remoteIp);
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/siteverify',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!verifyResponse.ok) {
      return {
        success: false,
        error_codes: [`http-${verifyResponse.status}`],
      };
    }

    const data = (await verifyResponse.json()) as TurnstileVerifyResponse;
    return data;
  } catch (error) {
    return {
      success: false,
      error_codes: ['fetch-error'],
    };
  }
}

export function isTurnstileEnabled(): boolean {
  return !!env.TURNSTILE_SECRET_KEY && !!env.TURNSTILE_SITE_KEY;
}
