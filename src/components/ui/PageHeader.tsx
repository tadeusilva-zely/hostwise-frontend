interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1
        className="text-2xl font-bold"
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'Lexend, Inter, system-ui, sans-serif',
        }}
      >
        {title}
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
