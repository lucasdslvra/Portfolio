import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	async redirects() {
		// Anciennes URL (indexées) vers les nouvelles routes françaises.
		return [
			{ source: "/projects", destination: "/projets", permanent: true },
			{ source: "/projects/:slug", destination: "/projets/:slug", permanent: true },
		];
	},
	async headers() {
		return [
			{
				source: "/clips/:path*",
				headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
			},
		];
	},
};

export default withContentlayer(nextConfig);
