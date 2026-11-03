import fs from "node:fs";
import path from "node:path";
import { defineDocumentType, defineNestedType, makeSource } from "contentlayer/source-files";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import { CORNERS } from "./lib/circuit";

// Retire le numéro saisi à la main dans les titres (« ## 1. Le cycle… ») :
// la numérotation affichée est calculée.
const HEADING_PREFIX = /^\s*\d+\.\s+/;

/** Les `##` du MDX, dans l'ordre, hors blocs de code. Même slug que rehypeSections. */
function extractToc(raw) {
	const slugger = new GithubSlugger();
	const toc = [];
	let inFence = false;
	for (const line of raw.split("\n")) {
		if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
		if (inFence) continue;
		const match = /^##\s+(.+?)\s*#*\s*$/.exec(line);
		if (!match) continue;
		const title = match[1].replace(/[*_`]/g, "").replace(HEADING_PREFIX, "").trim();
		toc.push({
			id: slugger.slug(title),
			n: String(toc.length + 1).padStart(2, "0"),
			title,
		});
	}
	return toc;
}

function hastText(node) {
	if (node.type === "text") return node.value;
	return (node.children ?? []).map(hastText).join("");
}

function stripHeadingPrefix(node) {
	const first = node.children?.[0];
	if (!first) return;
	if (first.type === "text") first.value = first.value.replace(HEADING_PREFIX, "");
	else stripHeadingPrefix(first);
}

/**
 * Enveloppe chaque `##` et son contenu dans une <section id> numérotée,
 * supprime les `---` de séparation (les sections ont leur propre rythme).
 */
function rehypeSections() {
	return (tree) => {
		const slugger = new GithubSlugger();
		const out = [];
		let current = null;
		let count = 0;
		for (const node of tree.children) {
			if (node.type === "element" && node.tagName === "hr") continue;
			if (node.type === "element" && node.tagName === "h2") {
				stripHeadingPrefix(node);
				count += 1;
				const id = slugger.slug(hastText(node).trim());
				const n = String(count).padStart(2, "0");
				node.properties = { ...node.properties, id: `${id}-titre`, dataN: n };
				current = {
					type: "element",
					tagName: "section",
					properties: { id, ariaLabelledBy: `${id}-titre` },
					children: [node],
				};
				out.push(current);
				continue;
			}
			if (current) current.children.push(node);
			else out.push(node);
		}
		tree.children = out;
	};
}

function pngSize(file) {
	const buffer = fs.readFileSync(file);
	if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
	return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const isImg = (node) => node.type === "element" && node.tagName === "img";
const isBlank = (node) => node.type === "text" && node.value.trim() === "";

/**
 * Une figure ne peut pas être dans un <p> : on sort les images de leur paragraphe.
 * - image seule → figure ;
 * - image suivie d'un texte simple (« ![…](…) » puis une ligne) → ce texte devient la légende ;
 * - autre mélange → les images sortent, le texte reste dans des <p>.
 */
function liftImages(paragraph) {
	const parts = paragraph.children.filter((c) => !isBlank(c));
	if (!parts.some(isImg)) return [paragraph];
	if (parts.length === 1) return parts;
	if (parts.length === 2 && isImg(parts[0]) && parts[1].type === "text") {
		const img = parts[0];
		img.properties = { ...img.properties, caption: parts[1].value.trim() };
		return [img];
	}
	const out = [];
	let run = [];
	const flush = () => {
		if (run.some((c) => !isBlank(c))) out.push({ ...paragraph, children: run });
		run = [];
	};
	for (const child of paragraph.children) {
		if (isImg(child)) {
			flush();
			out.push(child);
		} else {
			run.push(child);
		}
	}
	flush();
	return out;
}

/**
 * Les images Markdown deviennent des figures (hors paragraphe) et reçoivent
 * leurs dimensions, lues dans public/.
 */
function rehypeImages() {
	const visit = (node) => {
		if (!node.children) return;
		node.children = node.children.flatMap((child) =>
			child.type === "element" && child.tagName === "p" ? liftImages(child) : [child],
		);
		for (const child of node.children) {
			if (child.type === "element" && child.tagName === "img") {
				const src = child.properties?.src;
				if (typeof src === "string" && src.startsWith("/")) {
					const file = path.join(process.cwd(), "public", src);
					const size = fs.existsSync(file) ? pngSize(file) : null;
					if (size) child.properties = { ...child.properties, ...size };
					else console.warn(`[contentlayer] dimensions introuvables pour ${src}`);
				}
			}
			visit(child);
		}
	};
	return (tree) => visit(tree);
}

const Links = defineNestedType(() => ({
	name: "Links",
	fields: {
		demo: { type: "string" },
		code: { type: "string" },
	},
}));

const Onboard = defineNestedType(() => ({
	name: "Onboard",
	fields: {
		clip: { type: "string", required: true },
		clipWebm: { type: "string" },
		poster: { type: "string" },
		telemetry: { type: "string" },
		record: { type: "string" },
	},
}));

export const Project = defineDocumentType(() => ({
	name: "Project",
	filePathPattern: "./projects/**/*.mdx",
	contentType: "mdx",
	fields: {
		published: { type: "boolean", default: true },
		title: { type: "string", required: true },
		date: { type: "date", required: true },
		corner: { type: "enum", options: CORNERS.map((c) => c.id), required: true },
		category: { type: "enum", options: ["perso", "equipe", "stage"], required: true },
		categoryLabel: { type: "string", required: true },
		short: { type: "string", required: true },
		description: { type: "string", required: true },
		stack: { type: "list", of: { type: "string" }, required: true },
		status: { type: "string", required: true },
		links: { type: "nested", of: Links },
		cover: { type: "string", required: true },
		onboard: { type: "nested", of: Onboard },
	},
	computedFields: {
		slug: {
			type: "string",
			resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
		},
		toc: {
			type: "json",
			resolve: (doc) => extractToc(doc.body.raw),
		},
	},
}));

export default makeSource({
	contentDirPath: "./content",
	documentTypes: [Project],
	mdx: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: [rehypeImages, rehypeSections],
	},
});
