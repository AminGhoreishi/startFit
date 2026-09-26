interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey || !token) {
    return false;
  }

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data: TurnstileVerifyResponse = await response.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}
