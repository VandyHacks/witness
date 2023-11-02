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

		// add fallback
		config.resolve.fallback = {
			child_process: false,
			fs: false,
		};

		return config;
	},
	experimental: { nftTracing: true },
};
