const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const path = require( 'path' );

module.exports = {
  ...defaultConfig,
  plugins: [
    ...defaultConfig.plugins,
    new CopyWebpackPlugin( {
      patterns: [
        {
          from: '**/assets/**',
          context: path.resolve( __dirname, 'src' ),
          to: path.resolve( __dirname, 'build' ),
          noErrorOnMissing: true,
        },
      ],
    } ),
  ],
};
