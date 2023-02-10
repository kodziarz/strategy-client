const path = require('path');
module.exports = {
    entry: './frontEndTs/main.ts',
    output: {
        path: path.resolve(__dirname, "..", "frontEnd", "js"),
        filename: 'game.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    watch: true
};