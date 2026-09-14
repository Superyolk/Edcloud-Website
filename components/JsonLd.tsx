/**
 * Emits schema.org structured data. Rendered on the server into the static HTML so crawlers and
 * AI answer engines get it without running JavaScript.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // The data is authored in content/seo.ts, never user input. `<` is escaped so the JSON can
          // never close the script element early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
