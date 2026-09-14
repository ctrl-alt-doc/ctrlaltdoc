import config from '../../../ctrlaltdoc.config';
import content from 'ctrl-alt-doc/content';

export function getSiteConfig() {
	return { ...config, content };
}
