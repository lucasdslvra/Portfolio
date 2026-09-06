import { notFound } from "next/navigation";
import { allProjects } from "contentlayer/generated";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import { Metadata } from "next";
import "./mdx.css";

export const revalidate = 60;

type Props = {
	params: {
		slug: string;
	};
};

export async function generateStaticParams(): Promise<Props["params"][]> {
	return allProjects
		.filter((p) => p.published)
		.map((p) => ({
			slug: p.slug,
		}));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const slug = params?.slug;
	const project = allProjects.find((project) => project.slug === slug);

	if (!project) {
		return {};
	}

	return {
		title: project.title,
		description: project.description,
		alternates: {
			canonical: `/projects/${project.slug}`,
		},
		authors: [{ name: "Lucas Da Silveira", url: "https://ldasilveira.fr" }],
		openGraph: {
			title: project.title,
			description: project.description,
			type: "article",
			publishedTime: project.date,
			url: `https://ldasilveira.fr/projects/${project.slug}`,
			images: [
				{
					url: `https://ldasilveira.fr/og.png`, 
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: project.title,
			description: project.description,
		},
	};
}

export default async function PostPage({ params }: Props) {
	const slug = params?.slug;
	const project = allProjects.find((project) => project.slug === slug);

	if (!project) {
		notFound();
	}

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		name: project.title,
		headline: project.title,
		description: project.description,
		url: `https://ldasilveira.fr/projects/${project.slug}`,
		datePublished: project.date,
		inLanguage: "fr-FR",
		image: "https://ldasilveira.fr/og.png",
		author: {
			"@type": "Person",
			"@id": "https://ldasilveira.fr/#person",
			name: "Lucas Da Silveira",
			url: "https://ldasilveira.fr",
		},
		isPartOf: { "@id": "https://ldasilveira.fr/#website" },
		...(project.repository
			? { codeRepository: `https://github.com/${project.repository}` }
			: {}),
	};

	return (
		<div className="bg-zinc-50 min-h-screen">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<Header project={project} views={0} />
			{/* <ReportView slug={project.slug} /> */}

			<article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
				<Mdx code={project.body.code} />
			</article>
		</div>
	);
}
