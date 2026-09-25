import { customAlphabet } from 'nanoid';

const slugAlphabet = '23456789abcdefghjkmnpqrstuvwxyz';
const generateSlug = customAlphabet(slugAlphabet, 8);
const tokenAlphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const generateAdminToken = customAlphabet(tokenAlphabet, 32);

export function newSlug(): string {
  return generateSlug();
}

export function newAdminToken(): string {
  return generateAdminToken();
}
