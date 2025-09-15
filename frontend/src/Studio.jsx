import React from 'react';
import { AuthProvider } from './Auth';
import { Studio as StudioFeature } from './features/studio/Studio';

export function Studio() {
  return (
    <AuthProvider>
      <StudioFeature />
    </AuthProvider>
  );
}