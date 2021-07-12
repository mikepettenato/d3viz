const path = require('path');

module.exports =
    {
        entry: './src/index.js',
        output: {
            filename: 'petcharts.js',
            path: path.resolve(__dirname, 'dist'),
            library: 'petcharts',
            libraryTarget: 'window',
            // libraryExport: 'default'
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