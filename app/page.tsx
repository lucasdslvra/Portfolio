import Link from "next/link";
import React from "react";
import Particles from "./components/particles";

const navigation = [
	{ name: "Projets", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

const jsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Person",
			"@id": "https://ldasilveira.fr/#person",
			name: "Lucas Da Silveira",
			alternateName: ["Lucas da Silveira", "lucasdslvra", "ldasilveira"],
			url: "https://ldasilveira.fr",
			image: "https://ldasilveira.fr/og.png",
			jobTitle: "Étudiant en informatique",
			description:
				"Étudiant en informatique et développeur web. Projets en Next.js, React, TypeScript et Symfony.",
			knowsAbout: [
				"Développement web",
				"Next.js",
				"React",
				"TypeScript",
				"Symfony",
				"PHP",
			],
			knowsLanguage: ["fr", "en"],
			email: "mailto:lucasdslvra@gmail.com",
			sameAs: [
				"https://www.linkedin.com/in/lucasdslvra/",
				"https://github.com/lucasdslvra",
			],
		},
		{
			"@type": "WebSite",
			"@id": "https://ldasilveira.fr/#website",
			url: "https://ldasilveira.fr",
			name: "Lucas Da Silveira",
			alternateName: "Portfolio de Lucas Da Silveira",
			inLanguage: "fr-FR",
			publisher: { "@id": "https://ldasilveira.fr/#person" },
		},
		{
			"@type": "ProfilePage",
			"@id": "https://ldasilveira.fr/#profilepage",
			url: "https://ldasilveira.fr",
			name: "Lucas Da Silveira — Portfolio",
			isPartOf: { "@id": "https://ldasilveira.fr/#website" },
			about: { "@id": "https://ldasilveira.fr/#person" },
			inLanguage: "fr-FR",
		},
	],
};

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
			<script
				type="application/ld+json"
				// biome-ignore lint: structured data
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<nav className="my-16 animate-fade-in">
				<ul className="flex items-center justify-center gap-4">
					{navigation.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="text-sm duration-500 text-zinc-500 hover:text-zinc-300"
						>
							{item.name}
						</Link>
					))}
				</ul>
			</nav>
			<div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<Particles
				className="absolute inset-0 -z-10 animate-fade-in"
				quantity={100}
			/>
			<h1 className="py-3.5 px-0.5 z-10 text-4xl text-transparent duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
				Lucas Da Silveira
			</h1>

			<div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<div className="my-16 text-center animate-fade-in">
				<h2 className="text-sm text-zinc-500 ">Étudiant en informatique </h2>
			</div>

			<p className="sr-only">
				Lucas Da Silveira est étudiant en informatique et développeur web. Ce
				portfolio présente ses projets réalisés en Next.js, React, TypeScript et
				Symfony, ses expériences professionnelles ainsi que ses coordonnées de
				contact.
			</p>
		</div>
	);
}
