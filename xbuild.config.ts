/**
 * Import will remove at compile time
 */

import type { xBuildConfig } from '@remotex-labs/xbuild';

/**
 * Imports
 */

import { version } from 'process';
import pkg from './package.json' with { type: 'json' };

/**
 * Config build
 */

const config: Array<xBuildConfig> = [
    {
        bundleDeclaration: true,
        esbuild: {
            bundle: true,
            minify: false,
            format: 'esm',
            outdir: 'dist/esm',
            target: [ `node${ version.slice(1) }` ],
            platform: 'browser',
            packages: 'external',
            sourcemap: true,
            sourceRoot: `https://github.com/remotex-labs/xjet-expect/tree/v${ pkg.version }///`,
            minifySyntax: true,
            preserveSymlinks: true,
            minifyWhitespace: true,
            minifyIdentifiers: false,
            entryPoints: {
                'index': 'src/index.ts'
            }
        }
    },
    {
        noTypeChecker: true,
        bundleDeclaration: false,
        esbuild: {
            bundle: true,
            format: 'cjs',
            outdir: 'dist/cjs'
        }
    }
];

export default config;
