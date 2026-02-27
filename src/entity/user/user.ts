import { USER_ERRORS } from './error-messages';
import { EntityError } from '../errors/entity-error';

/**
 * A class to represent CLARK users.
 *
 * @class
 */
export class User {
    // eslint-disable-next-line @typescript-eslint/naming-convention
private _id: string;
  get userId(): string {
    return this._id;
  }
  set userId(id: string) {
      this._id = id;
  }
  _username: string;
  /**
   * @property {string} username a user's unique log-in username
   */
  get username(): string {
    return this._username;
  }

  _name: string;
  /**
   * @property {string} name a user's real-life name
   */
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    if (name && name.trim()) {
      this._name = name.trim();
    }
  }

  /**
   * Returns first index of name string split by white space
   *
   * @readonly
   * @type {string}
   * @memberof User
   */
  get firstName(): string {
    const firstname = this.name ? this.name.split(' ')[0] : undefined;
    return this.name ? firstname.split('#').join(' ') : undefined;
  }

  /**
   * Returns name split by white space without value at the first index
   *
   * @readonly
   * @type {string}
   * @memberof User
   */
  get lastName(): string {
    const lastname = this.name ? this.name.split(' ')[1] : undefined;
    return this.name ? lastname.split('#').join(' ') : undefined;
  }

  _email: string;
  /**
   * @property {string} email a user's email on file
   */
  get email(): string {
    return this._email;
  }
  set email(email: string) {
    if (email && User.isValidEmail(email)) {
      this._email = email;
    } else {
      throw new EntityError(USER_ERRORS.INVALID_EMAIL(email), 'email');
    }
  }

  _emailVerified: boolean;
  /**
   * @property {boolean} emailVerified a user's email on file
   */
  get emailVerified(): boolean {
    return this._emailVerified;
  }
  set emailVerified(emailVerified: boolean) {
    if (emailVerified) {
      this._emailVerified = emailVerified;
    }
  }

  _organization: string;
  /**
   * @property {string} organization a user's associate organization
   */
  get organization(): string {
    return this._organization;
  }
  set organization(organization: string) {
    if (organization && organization.trim()) {
      this._organization = organization;
    }
  }

  _organizationId: string;
  /**
   * @property {string} organizationId a user's associated organization ID (ObjectId)
   */
  get organizationId(): string {
    return this._organizationId;
  }
  set organizationId(organizationId: string) {
    if (organizationId && organizationId.trim()) {
      this._organizationId = organizationId;
    }
  }

  _bio: string;
  /**
   * @property {string} bio a user's bio
   */
  get bio(): string {
    return this._bio;
  }
  set bio(bio: string) {
    if (bio) {
      this._bio = bio.trim();
    }
  }
  /**
   * @property {string} createdAt timestamp of user entity creation
   */
  _createdAt: string;
  get createdAt(): string {
    return this._createdAt;
  }

  /**
   * Creates an instance of User.
   *
   * @param {Partial<any>}
   * User entity needs a rewrite, hence the `any`
   * @memberof User
   */
  // Had to update the constructor to accept any type of user object
  // because the backend now returns _id instead of userId and the
  // frontend uses userId...
  constructor(user?: any) {
    this._id = user?.userId || user?._id || '';
    this._username = user?.username || '';
    this._name = user?.name || '';
    this._email = user?.email || '';
    this._emailVerified = user?.emailVerified || false;
    this._organization = user?.organization || '';
    this._organizationId = user?.organizationId || '';
    this._bio = user?.bio || '';
    this._createdAt = user?.createdAt || Date.now().toString();
  }

  /**
   * Converts User to plain object without functions and private properties
   *
   * @returns {Partial<User>}
   * @memberof User
   */
  public toPlainObject(): Partial<User> {
    const user: Partial<User> = {
      userId: this._id,
      username: this.username,
      name: this.name,
      email: this.email,
      emailVerified: this.emailVerified,
      organization: this.organization,
      organizationId: this.organizationId,
      bio: this.bio,
      createdAt: this.createdAt,
    };
    return user;
  }
}

export namespace User {
  /**
   * Checks email provided again email regex pattern
   *
   * @export
   * @param {string} email
   * @returns {boolean}
   */
  export function isValidEmail(email: string): boolean {
    // eslint-disable-next-line max-len
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailPattern.test(email)) {
      return true;
    }
    return false;
  }
}
