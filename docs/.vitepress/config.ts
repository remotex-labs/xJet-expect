/**
 * Imports
 */

import { defineVersionedConfig } from '@viteplus/versions';

/**
 * Doc config
 */

export default defineVersionedConfig({
    title: 'xJet-expect',
    base: '/xJet-expect/',
    description: 'xJet-Expect: Powerful Assertions for Seamless xJet Testing',
    head: [
        [ 'link', { rel: 'icon', type: 'image/png', href: '/xJet-expect/logo.png' }],
        [ 'meta', { name: 'theme-color', content: '#ff7e17' }],
        [ 'script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-LZ4KRNH629' }],
        [
            'script', {},
            'window.dataLayer = window.dataLayer || [];function gtag(){ dataLayer.push(arguments); }gtag(\'js\', new Date());gtag(\'config\', \'G-LZ4KRNH629\');'
        ]
    ],
    versionsConfig: {
        current: 'v2.0.x',
        versionSwitcher: false
    },
    themeConfig: {
        logo: '/logo.png',

        search: {
            provider: 'local'
        },

        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide' },
            { component: 'VersionSwitcher' }
        ],

        sidebar: [
            { text: 'Modifiers', link: '/guide/modifiers' },
            { text: 'Asymmetric', link: '/guide/asymmetric' },
            {
                text: 'Matchers',
                collapsed: false,
                base: '/guide/',
                items: [
                    { text: 'Mock', link: 'mock' },
                    { text: 'Number', link: 'number' },
                    { text: 'Object', link: 'object' },
                    { text: 'String', link: 'string' },
                    { text: 'Equality', link: 'equality' },
                    { text: 'Functions', link: 'functions' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/remotex-labs/xJet-expect' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@remotex-labs/xjet-expect' }
        ],

        docFooter: {
            prev: false,
            next: false
        },

        footer: {
            message: 'Released under the Mozilla Public License 2.0',
            copyright: `Copyright © ${ new Date().getFullYear() } @remotex-labs/xjet Contributors`
        }
    }
});
