module.exports = {
    plugins: [
        [
            '@snowpack/plugin-typescript'
        ]
    ],

    buildOptions: {
        out: '../wwwroot/js/',
        clean: false
    },

    mount: {
        'src': '/'
    },
};