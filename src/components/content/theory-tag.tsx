interface TheoryTagProps {
  tag: string;
}

export function TheoryTag({ tag }: TheoryTagProps) {
  return (
    <span className="inline-flex rounded-full bg-surface-700 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
      {tag}
    </span>
  );
}
