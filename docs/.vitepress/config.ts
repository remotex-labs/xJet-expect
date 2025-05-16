/**
 * Imports
 */

import defineVersionedConfig from 'vitepress-versioning-plugin';

/**
 * Doc config
 */

export default defineVersionedConfig({
    title: 'xJet-expect',
    base: '/xJet-expect/',
    description: 'A versatile JavaScript and TypeScript toolchain build system',
    head: [
        [ 'link', { rel: 'icon', type: 'image/png', href: '/xJet-expect/xbuild2.png' }],
        [ 'meta', { name: 'theme-color', content: '#ff7e17' }],
        [ 'script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-PXPEYPM3R0' }],
        [
            'script', {},
            'window.dataLayer = window.dataLayer || [];function gtag(){ dataLayer.push(arguments); }gtag(\'js\', new Date());gtag(\'config\', \'G-PXPEYPM3R0\');'
        ]
    ],
    themeConfig: {
        logo: '/xjet-expect2.png',
        versionSwitcher: false,

        search: {
            provider: 'local'
        },

        nav: [
            { text: 'Home', link: '.' },
            {
                component: 'VersionSwitcher'
            }
        ],

        sidebar: {
            '/': [{ text: 'Guide', link: '.' }]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/remotex-labs/xJet-expect' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@remotex-labs/xjet-expect' }
        ],

        docFooter: {
            prev: false,
            next: false
        }
    },
    versioning: {
        latestVersion: 'v1.0.0'
    }
}, __dirname);
