import { em } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

/** Below Mantine's `sm` breakpoint (48em). */
const PHONE_QUERY = `(max-width: ${em(767.98)})`;

export const isPhone = () => window.matchMedia(PHONE_QUERY).matches;

export const useIsPhone = () => useMediaQuery(PHONE_QUERY, isPhone(), { getInitialValueInEffect: false });
