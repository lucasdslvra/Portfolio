import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Contacter Lucas Da Silveira, étudiant en informatique et développeur web : email, LinkedIn et GitHub.",
	alternates: { canonical: "/contact" },
	openGraph: {
		title: "Contact | Lucas Da Silveira",
		description:
			"Contacter Lucas Da Silveira, étudiant en informatique et développeur web : email, LinkedIn et GitHub.",
		url: "https://ldasilveira.fr/contact",
		type: "profile",
	},
};

export default function ContactLayout({
	children,
}: { children: React.ReactNode }) {
	return <>{children}</>;
}
