import { searchEndpoint } from 'ctrl-alt-doc/api';

import { getSiteConfig } from '$lib/server/site';

export const GET = searchEndpoint(getSiteConfig);
