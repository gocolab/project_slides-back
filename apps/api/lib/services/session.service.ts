export class SessionService {
  private initialParams = new Map<string, { topic: string, audience: string, slideCount: number }>();

  createSession(topic: string, audience: string, slideCount: number): string {
    const sessionId = crypto.randomUUID();
    this.initialParams.set(sessionId, { topic, audience, slideCount });
    return sessionId;
  }

  getInitialParams(sessionId: string) {
    return this.initialParams.get(sessionId);
  }
}

export const sessionService = new SessionService();
