const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	reactStrictMode: true,
	// modify webpack so that /email folder is copied to /server/email when building
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.plugins.push(
				new CopyPlugin({
					patterns: [{ from: 'email', to: 'server/email' }],
				})
			);
		}

		return config;
	},
};
