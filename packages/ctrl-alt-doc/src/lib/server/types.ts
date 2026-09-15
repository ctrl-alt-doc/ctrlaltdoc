import type { TocItem } from './toc.js';

export type { TocItem } from './toc.js';

export type Badge = 'New' | 'Updated' | 'Beta';

export interface SidebarConfig {
	label?: string;
	position?: number;
	hidden?: boolean;
	badge?: Badge;
}

export interface CategoryConfig {
	label?: string;
	position?: number;
	collapsed?: boolean;
	hidden?: boolean;
	badge?: Badge;
}

export interface DocumentFrontmatter {
	title: string;
	description?: string;
	excerpt?: string;
	sidebar?: SidebarConfig;
	draft?: boolean;
	toc?: boolean;
}

export interface Document {
	title: string;
	description: string;
	excerpt: string;
	slug: string;
	path: string;
	source: string;
	content: string;
	toc: TocItem[];
	frontmatter: DocumentFrontmatter;
}

export interface NavigationItem {
	title: string;
	slug: string;
	type: 'page' | 'category';
	position?: number;
	hidden?: boolean;
	collapsed?: boolean;
	children?: NavigationItem[];
	description?: string;
	badge?: Badge;
}

export interface CtrlaltdocThemeConfig {
	sidebar?: boolean;
}

export interface SearchResult {
	title: string;
	description: string;
	slug: string;
	excerpt: string;
}

export interface BreadcrumbItem {
	title: string;
	slug: string;
}

export interface PaginationItem {
	title: string;
	slug: string;
}

export interface Pagination {
	previous?: PaginationItem;
	next?: PaginationItem;
}

export interface DocCard {
	title: string;
	description: string;
	slug: string;
	badge?: Badge;
}
