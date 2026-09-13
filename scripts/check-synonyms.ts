// Flags two kinds of drift between the content and the synonym graph:
//   - a synonym term that shows up in none of your posts (dead weight)
//   - a post's `keywords` entry that isn't connected to the synonym graph
//     at all (a missed opportunity to make it findable from related terms)
// Informational only — doesn't fail the build. Run with `pnpm run synonyms:check`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { buildSynonymGraph } from '../src/utils/synonymGraph';

const CONTENT_DIRS = ['src/content/projects', 'src/content/notes'];

function findContentFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...findContentFiles(full));
		} else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
			out.push(full);
		}
	}
	return out;
}

interface PostText {
	file: string;
	keywords: string[];
	searchableText: string;
}

function loadPosts(): PostText[] {
	const posts: PostText[] = [];
	for (const dir of CONTENT_DIRS) {
		for (const file of findContentFiles(dir)) {
			const raw = readFileSync(file, 'utf-8');
			const { data, content } = matter(raw);
			const keywords: string[] = data.keywords ?? [];
			const parts = [
				data.title ?? '',
				data.summary ?? '',
				...(data.skills ?? []),
				...(data.tech ?? []),
				...(data.domains ?? []),
				...keywords,
				content,
			];
			posts.push({
				file,
				keywords,
				searchableText: parts.join(' ').toLowerCase(),
			});
		}
	}
	return posts;
}

function main() {
	const posts = loadPosts();
	const graph = buildSynonymGraph();
	const allTerms = Array.from(graph.adjacency.keys());

	const unusedTerms = allTerms.filter(
		(term) => !posts.some((post) => post.searchableText.includes(term)),
	);

	const missedKeywords: { file: string; keyword: string }[] = [];
	for (const post of posts) {
		for (const keyword of post.keywords) {
			if (!graph.adjacency.has(keyword.toLowerCase())) {
				missedKeywords.push({ file: post.file, keyword });
			}
		}
	}

	console.log(`Checked ${posts.length} post(s) against ${allTerms.length} synonym term(s).\n`);

	if (unusedTerms.length > 0) {
		console.log(`Unused synonym terms (appear in no post — ${unusedTerms.length}):`);
		for (const term of unusedTerms.sort()) console.log(`  - ${term}`);
		console.log('');
	} else {
		console.log('No unused synonym terms.\n');
	}

	if (missedKeywords.length > 0) {
		console.log(`Keywords with no synonym mapping (${missedKeywords.length}):`);
		for (const { file, keyword } of missedKeywords) console.log(`  - "${keyword}" in ${file}`);
		console.log('');
	} else {
		console.log('Every keyword is connected to the synonym graph.\n');
	}
}

main();
