import { defineConfig } from 'ctrl-alt-doc';

export default defineConfig({
	title: 'My Docs',

	description: 'Your documentation.',

	theme: {
		sidebar: true
	},

	navbar: {
		logo: {
			light: '',
			dark: ''
		},
		logoAlt: 'Ctrl+Alt+Doc',
		socials: {
			github: 'https://github.com/example',
			x: 'https://x.com/example',
			discord: 'https://discord.gg/example',
			youtube: 'https://youtube.com/@example',
			bluesky: 'https://bsky.app/profile/example.bsky.social'
		}
	},

	footer: {
		showBranding: true,

		text: '\u00A9 2026 My Company',

		links: [
			{
				label: 'GitHub',
				href: 'https://github.com/example'
			},
			{
				label: 'Privacy',
				href: '/privacy'
			}
		]
	},

	icons: {
		lightbulb: `
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M8.5 14.5A7 7 0 1 1 15.5 14.5C14.5 15.5 14 16.5 14 18h-4c0-1.5-.5-2.5-1.5-3.5Z" />
    `
	},

	callouts: {
		note: {
			label: 'Note',
			icon: 'info'
		},

		tip: {
			label: 'Tip',
			icon: 'lightbulb'
		},

		warning: {
			label: 'Warning',
			icon: 'warning'
		},

		danger: {
			label: 'Danger',
			icon: 'danger'
		}
	}
});
