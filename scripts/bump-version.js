#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );

const pkgPath = path.resolve( __dirname, '../package.json' );
const phpPath = path.resolve( __dirname, '../vh-wp-blocks.php' );

const pkg = JSON.parse( fs.readFileSync( pkgPath, 'utf8' ) );
const [ major, minor, patch ] = pkg.version.split( '.' ).map( Number );
const newVersion = `${ major }.${ minor }.${ patch + 1 }`;

pkg.version = newVersion;
fs.writeFileSync( pkgPath, JSON.stringify( pkg, null, 2 ) + '\n' );

const php = fs.readFileSync( phpPath, 'utf8' );
fs.writeFileSync(
  phpPath,
  php.replace( /(\* Version:\s+)[\d.]+/, `$1${ newVersion }` )
);

console.log( `Version bumped to ${ newVersion }` );
