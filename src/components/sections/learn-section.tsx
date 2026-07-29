import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LearnSection({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
