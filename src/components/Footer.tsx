export function Footer() {
  // Rendered on the server; the year is stable within a request.
  const year = new Date().getFullYear();

  return (
    <footer className="border-border text-muted-foreground mt-auto border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>Music search engine</p>
        <p>
          <span className="tabular-nums">{year}</span> · Built with Next.js
        </p>
      </div>
    </footer>
  );
}
