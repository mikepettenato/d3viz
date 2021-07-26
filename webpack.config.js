const path = require('path');

module.exports =
    {
        entry: './src/index.js',
        output: {
            filename: 'petcharts.js',
            path: path.resolve(__dirname, 'dist'),
            library: 'petcharts',
            libraryTarget: 'window',
            pathinfo: true,
            // libraryExport: 'default'
        },
        devtool: 'cheap-module-source-map',
        resolve: {
            alias: {
             'node_modules': path.join(__dirname, 'node_modules')
            }
        },
        watch: true,
        mode: 'development',
        devServer: {
            contentBase: __dirname,
            // compress: true,
            port: 9000,
            hot: true
        },
    };