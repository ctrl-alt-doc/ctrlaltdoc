import type { NavigationItem } from './types.js';

export interface PaginationItem {
	title: string;
	slug: string;
}

export interface Pagination {
	previous?: PaginationItem;
	next?: PaginationItem;
}

export function createPagination(items: NavigationItem[], currentPath: string): Pagination {
	const currentIndex = items.findIndex((item) => item.slug === currentPath);

	if (currentIndex === -1) {
		return {};
	}

	return {
		previous: currentIndex > 0 ? items[currentIndex - 1] : undefined,

		next: currentIndex < items.length - 1 ? items[currentIndex + 1] : undefined
	};
}
