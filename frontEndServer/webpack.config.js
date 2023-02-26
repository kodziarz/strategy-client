const path = require('path');
var config = {
    module: {}
};

var loginConfig = Object.assign({}, config, {
    entry: './frontEndTs/LoginController.ts',
    output: {
        path: path.resolve(__dirname, "..", "frontEnd", "js"),
        filename: 'login.js'
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
});

var gameConfig = Object.assign({}, config, {
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
});

module.exports = [loginConfig, gameConfig];

// module.exports = {
//     entry: './frontEndTs/main.ts',
//     output: {
//         path: path.resolve(__dirname, "..", "frontEnd", "js"),
//         filename: 'game.js'
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: ['ts-loader'],
//                 exclude: /node_modules/
//             }
//         ]
//     },
//     resolve: {
//         extensions: ['.tsx', '.ts', '.js']
//     },
//     watch: true
// };