import * as firebase from "firebase-admin";
import * as uno from "uno-serverless";
import { memoize } from "uno-serverless";

export type UserRecord = firebase.auth.UserRecord;

export interface AuthService {
  /**
   * Initialize the service with the value of the HTTP Authorization header.
   */
  init(authorizationHeader: string): Promise<void>;

  /**
   * Return whether or not a user is authenticated.
   */
  isAuthenticated(): boolean;

  /**
   * Returns a promise that  which will resolve with the authenticated user.
   *
   * If no user is authenticated the promise will reject.
   */
   authenticatedUser(): Promise<UserRecord>;

  /**
   * Returns a promise which will resolve with the ID of the authenticated user.
   *
   * If no user is authenticated the promise will reject.
   */
  authenticatedUserId(): Promise<string>;
}

export class FirebaseAuthService implements AuthService {

  private idToken?: firebase.auth.DecodedIdToken;

  constructor(public readonly app: firebase.app.App) {}

  public async init(authorizationHeader: string) {
    if (this.isAuthenticated()) {
      throw uno.internalServerError("FirebaseAuthService is already initialized");
    }
    if (!authorizationHeader.startsWith("Bearer")) {
      throw uno.unauthorizedError("Authorization header", "Not a bearer token");
    }
    try {
      // @ts-ignore
      this.idToken =  await this.app.auth().verifyIdToken(authorizationHeader.substring(7));
    } catch (e) {
      throw uno.unauthorizedError("Authorization header", "Invalid token");
    }
  }

  public isAuthenticated() {
    return this.idToken !== undefined;
  }

  public async authenticatedUser() {
    if (!this.isAuthenticated() || this.idToken === undefined) {
      throw uno.internalServerError("User not authenticated.");
    }
    return this.app.auth().getUser(this.idToken.uid);
  }

  public async authenticatedUserId() {
    if (!this.isAuthenticated() || this.idToken === undefined) {
      throw uno.internalServerError("User not authenticated.");
    }
    return this.idToken.uid;
  }
}
