import { SYNONYMS } from '../data/synonyms';

// How many hops beyond the direct match to follow before stopping — keeps
// "x band" -> "radar" -> "pulse compression" working without the whole
// graph collapsing into one blob after a few more entries get added.
// Tune this constant, not the expansion logic, if that ever needs to change.
export const MAX_TRANSITIVE_HOPS = 1;

export interface SynonymGraph {
  /** Every edge, both directions, deduped and lowercased. */
  adjacency: Map<string, Set<string>>;
}

/** Builds the bidirectional graph once from the one-directional SYNONYMS table. */
export function buildSynonymGraph(): SynonymGraph {
  const adjacency = new Map<string, Set<string>>();

  const link = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    adjacency.get(a)!.add(b);
  };

  for (const [term, related] of Object.entries(SYNONYMS)) {
    const from = term.toLowerCase();
    for (const raw of related) {
      const to = raw.toLowerCase();
      link(from, to);
      link(to, from);
    }
  }

  return { adjacency };
}

/**
 * Expands a query against the graph: direct matches, plus up to
 * MAX_TRANSITIVE_HOPS additional hops outward. Returns only the *added*
 * terms (never the original query terms themselves), so callers can both
 * feed them to search and show them to the user as "also searching: ...".
 */
export function expandQuery(query: string, graph: SynonymGraph): string[] {
  const queryTerms = new Set(
    query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
  );
  const fullQuery = query.trim().toLowerCase();
  if (fullQuery) queryTerms.add(fullQuery);

  let frontier = new Set<string>();
  for (const term of queryTerms) {
    for (const neighbor of graph.adjacency.get(term) ?? []) {
      frontier.add(neighbor);
    }
  }

  const found = new Set(frontier);
  let currentFrontier = frontier;

  for (let hop = 0; hop < MAX_TRANSITIVE_HOPS; hop++) {
    const nextFrontier = new Set<string>();
    for (const term of currentFrontier) {
      for (const neighbor of graph.adjacency.get(term) ?? []) {
        if (!found.has(neighbor) && !queryTerms.has(neighbor)) {
          nextFrontier.add(neighbor);
          found.add(neighbor);
        }
      }
    }
    currentFrontier = nextFrontier;
    if (currentFrontier.size === 0) break;
  }

  // Never echo back a term the user already typed.
  for (const term of queryTerms) found.delete(term);

  return Array.from(found);
}
