export interface PublicErrorBody {
  error: {
    code: string;
    message: string;
    guidance: string;
  };
}

export class PublicError extends Error {
  readonly code: string;
  readonly guidance: string;
  readonly status: number;

  constructor(code: string, message: string, guidance: string, status = 400) {
    super(message);
    this.name = "PublicError";
    this.code = code;
    this.guidance = guidance;
    this.status = status;
  }
}

export function toPublicErrorBody(error: PublicError): PublicErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
      guidance: error.guidance,
    },
  };
}
