export { getDocument, getDocCards, getDocuments } from './lib/server/documents.js';
export { getNavigation, flattenNavigation } from './lib/server/navigation.js';
export { createTableOfContents } from './lib/server/toc.js';
export { createBreadcrumbs } from './lib/server/breadcrumbs.js';
export { createPagination } from './lib/server/pagination.js';
export { searchDocuments } from './lib/server/search.js';

export type {
	BreadcrumbItem,
	CategoryConfig,
	Document,
	DocumentFrontmatter,
	DocCard,
	NavigationItem,
	Pagination,
	PaginationItem,
	SearchResult,
	SidebarConfig,
	TocItem
} from './lib/server/types.js';