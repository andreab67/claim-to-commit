interface EmptyStateProps {
  title: string;
  message: string;
  guidance?: string;
  onRetry?: () => void;
}

export function EmptyState({
  title,
  message,
  guidance,
  onRetry,
}: EmptyStateProps) {
  return (
    <section className="empty-state" role="alert">
      <span className="empty-mark" aria-hidden="true">!</span>
      <p className="section-label">Evidence interrupted</p>
      <h1>{title}</h1>
      <p>{message}</p>
      {guidance ? <p className="empty-guidance">{guidance}</p> : null}
      {onRetry ? (
        <button type="button" onClick={onRetry}>Open bundled demonstration</button>
      ) : null}
    </section>
  );
}
