import { User } from './user';
import { USER_ERRORS } from './error-messages';

// Defaults

// Valid values
const validUsername = 'itsMe123';
const firstName = 'Itis';
const lastName = 'Me Too';
const validName = `${firstName} ${lastName}`;
const validEmail = 'it@me.com';
const validOrganization = 'My Organization';
const validBio = 'All about me';

// Invalid values
const invalidEmail = 'not a valid email';

describe('Class: User', () => {
  let user: User;
  beforeEach(() => {
    user = new User();
  });

  it('should return a new blank User', () => {
    expect(user).toBeDefined();
  });
  it('should return a new User with valid properties', () => {
    const someUser: Partial<User> = {
      username: validUsername,
      name: validName,
      email: validEmail,
      organization: validOrganization,
      bio: validBio,
    };
    const newUser = new User(someUser);
    expect(newUser).toBeDefined();
  });
  it('should set invalid email and thrown an error', () => {
    const errorMessage = USER_ERRORS.INVALID_EMAIL(invalidEmail);
    try {
      user.email = invalidEmail;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should return the user\'s first name', () => {
    user.name = validName;
    expect(user.firstName).toEqual(firstName);
  });
  it('should return the user\'s last name', () => {
    user.name = validName;
    expect(user.lastName).toEqual(lastName);
  });
});
