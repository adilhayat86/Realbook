import { UserRole } from '@/types';

export function canPostListings(role: UserRole) {
  return role === 'verified_agent' || role === 'admin';
}

export function canComment(role: UserRole) {
  return role === 'verified_agent' || role === 'admin';
}

export function canFollowAgents(role: UserRole) {
  return role === 'verified_agent' || role === 'admin';
}

export function canCreateRequirements(role: UserRole) {
  return role === 'verified_agent' || role === 'admin';
}

export function isReadOnlyRole(role: UserRole) {
  return role === 'guest' || role === 'pending_agent';
}

export function isBanned(role: UserRole) {
  return role === 'banned';
}
