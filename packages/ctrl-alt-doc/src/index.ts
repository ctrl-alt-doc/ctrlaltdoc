export interface CtrlaltdocThemeConfig {
	sidebar?: boolean;
}

export interface CalloutConfig {
	label?: string;
	icon?: string;
}

export interface FooterLink {
	label: string;
	href: string;
}

export interface FooterConfig {
	showBranding?: boolean;
	text?: string;
	links?: FooterLink[];
}

export interface NavbarLogoConfig {
	light?: string;
	dark?: string;
}

export type SocialPlatform =
	| 'github'
	| 'x'
	| 'discord'
	| 'instagram'
	| 'youtube'
	| 'linkedin'
	| 'twitch'
	| 'bluesky'
	| 'reddit';

export type SocialLinks = Partial<Record<SocialPlatform, string>>;

export interface NavbarConfig {
	logo?: NavbarLogoConfig;
	logoAlt?: string;
	socials?: SocialLinks;
}

export interface CtrlAltDocConfig {
	title: string;
	description?: string;
	icons?: Record<string, string>;
	navbar?: NavbarConfig;
	callouts?: Record<string, CalloutConfig>;
	theme?: CtrlaltdocThemeConfig;
	footer?: FooterConfig;
}

export function defineConfig(config: CtrlAltDocConfig): CtrlAltDocConfig {
	return config;
}
