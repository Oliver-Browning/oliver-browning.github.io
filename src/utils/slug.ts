// `tech` values in taxonomy.ts can contain spaces ("CST Studio") that
// aren't URL-safe. This is the one place that turns a tech name into a
// route segment — every /tech/ link and the [tool] route itself both
// import it, so they can never drift out of sync with each other.
export function techSlug(tech: string): string {
  return tech.toLowerCase().replace(/\s+/g, '-');
}
