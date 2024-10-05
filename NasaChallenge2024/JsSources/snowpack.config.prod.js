module.exports = {
    plugins: [
        [
            '@snowpack/plugin-optimize',
            '@snowpack/plugin-typescript'
        ]
    ],

    buildOptions: {
        out: '../wwwroot/js/',
        clean: true
    },

    mount: {
        'src': '/'
    },
};