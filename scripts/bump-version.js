#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'fs' ).readdirSync;

const root = path.resolve( __dirname, '..' );
const pkgPath = path.join( root, 'package.json' );
const phpPath = path.join( root, 'vh-wp-blocks.php' );

const pkg = JSON.parse( fs.readFileSync( pkgPath, 'utf8' ) );
const [ major, minor, patch ] = pkg.version.split( '.' ).map( Number );
const newVersion = `${ major }.${ minor }.${ patch + 1 }`;

// package.json
pkg.version = newVersion;
fs.writeFileSync( pkgPath, JSON.stringify( pkg, null, 2 ) + '\n' );

// vh-wp-blocks.php plugin header
const php = fs.readFileSync( phpPath, 'utf8' );
fs.writeFileSync(
  phpPath,
  php.replace( /(\* Version:\s+)[\d.]+/, `$1${ newVersion }` )
);

// src/**/block.json
const srcDir = path.join( root, 'src' );
for ( const block of glob( srcDir ) ) {
  const blockJsonPath = path.join( srcDir, block, 'block.json' );
  if ( ! fs.existsSync( blockJsonPath ) ) continue;
  const blockJson = JSON.parse( fs.readFileSync( blockJsonPath, 'utf8' ) );
  if ( ! ( 'version' in blockJson ) ) continue;
  blockJson.version = newVersion;
  fs.writeFileSync( blockJsonPath, JSON.stringify( blockJson, null, 2 ) + '\n' );
}

console.log( `Version bumped to ${ newVersion }` );

// Commit the version bump
const { execSync } = require( 'child_process' );
execSync( `git add package.json vh-wp-blocks.php src/`, { cwd: root, stdio: 'inherit' } );
execSync( `git commit -m "🔖 Bump version to ${ newVersion }"`, { cwd: root, stdio: 'inherit' } );
