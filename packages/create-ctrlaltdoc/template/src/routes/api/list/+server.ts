import { listEndpoint } from 'ctrl-alt-doc/api';

import { getSiteConfig } from '$lib/server/site';

export const GET = listEndpoint(getSiteConfig);
