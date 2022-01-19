/* eslint-disable @typescript-eslint/naming-convention */export const USER_ERRORS = {
  INVALID_EMAIL(email: any) {
    return `${email} is not a valid email`;
  },
  ID_SET: 'Id has already been set and cannot be modified.'
};
