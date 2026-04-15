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

export const config: xBuildConfig = {
    common: {
        esbuild: {
            bundle: true,
            minify: false,
            target: [ `node${ version.slice(1) }` ],
            platform: 'browser',
            packages: 'external',
            sourcemap: true,
            sourceRoot: `https://github.com/remotex-labs/xjet-expect/tree/v${ pkg.version }/`,
            minifySyntax: true,
            minifyWhitespace: true,
            minifyIdentifiers: false,
            entryPoints: {
                'index': 'src/index.ts'
            }
        }
    },
    variants: {
        esm: {
            esbuild: {
                format: 'esm',
                outdir: 'dist/esm'
            }
        },
        cjs: {
            esbuild: {
                format: 'cjs',
                outdir: 'dist/cjs'
            }
        }
    }
};
