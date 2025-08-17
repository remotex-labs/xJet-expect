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
    srcDir: 'src',
    description: 'A versatile JavaScript and TypeScript toolchain build system',
    head: [
        [ 'link', { rel: 'icon', type: 'image/png', href: '/xJet-expect/xbuild2.png' }],
        [ 'meta', { name: 'theme-color', content: '#ff7e17' }],
        [ 'script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-LZ4KRNH629' }],
        [
            'script', {},
            'window.dataLayer = window.dataLayer || [];function gtag(){ dataLayer.push(arguments); }gtag(\'js\', new Date());gtag(\'config\', \'G-LZ4KRNH629\');'
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
            '/': [
                { text: 'Guide', link: '.' },
                { text: 'Modifiers', link: './modifiers' },
                { text: 'Asymmetric', link: './asymmetric' },
                {
                    text: 'Matchers',
                    collapsed: false,
                    items: [
                        { text: 'Mock', link: './mock' },
                        { text: 'Number', link: './number' },
                        { text: 'Object', link: './object' },
                        { text: 'String', link: './string' },
                        { text: 'Equality', link: './equality' },
                        { text: 'Functions', link: './functions' }
                    ]
                }
            ]
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
        latestVersion: 'v1.0.x'
    }
}, __dirname);
