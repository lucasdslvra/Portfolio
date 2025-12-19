import { MetadataRoute } from "next";
import { allProjects } from "contentlayer/generated";

export default function sitemap(): MetadataRoute.Sitemap {
	const projects = allProjects
		.filter((project) => project.published)
		.map((project) => ({
			url: `https://ldasilveira.fr/projects/${project.slug}`,
			lastModified: project.date,
			priority: 0.7,
		}));

	const routes = [
		{
			url: "https://ldasilveira.fr",
			lastModified: new Date().toISOString().split("T")[0],
			priority: 1,
		},
		{
			url: "https://ldasilveira.fr/projects",
			lastModified: new Date().toISOString().split("T")[0],
			priority: 0.8,
		},
		{
			url: "https://ldasilveira.fr/contact",
			lastModified: new Date().toISOString().split("T")[0],
			priority: 0.5,
		},
	];

	return [...routes, ...projects];
}