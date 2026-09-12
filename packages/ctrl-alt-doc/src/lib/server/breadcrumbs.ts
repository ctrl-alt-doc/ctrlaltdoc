import type { BreadcrumbItem, NavigationItem } from './types.js';

function findBreadcrumbs(
	items: NavigationItem[],
	currentPath: string,
	parents: BreadcrumbItem[] = []
): BreadcrumbItem[] {
	for (const item of items) {
		const breadcrumb: BreadcrumbItem = {
			title: item.title,
			slug: item.slug
		};

		const trail = [...parents, breadcrumb];

		if (item.slug === currentPath) {
			return trail;
		}

		if (item.children?.length) {
			const result = findBreadcrumbs(item.children, currentPath, trail);

			if (result.length) {
				return result;
			}
		}
	}

	return [];
}

export function createBreadcrumbs(items: NavigationItem[], currentPath: string): BreadcrumbItem[] {
	const normalizedPath = currentPath.replace(/^\/+/, '').replace(/\/+$/, '');

	return findBreadcrumbs(items, normalizedPath);
}
