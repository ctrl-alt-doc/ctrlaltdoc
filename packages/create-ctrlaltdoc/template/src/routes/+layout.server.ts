import { getNavigation } from 'ctrl-alt-doc/server';

import { getSiteConfig } from '$lib/server/site';

export async function load() {
	const site = getSiteConfig();

	return {
		site,
		navigation: await getNavigation(site)
	};
}