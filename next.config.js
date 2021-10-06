module.exports = {
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/',
				destination: '/dashboard',
				permanent: true,
			},
		];
	},
};
