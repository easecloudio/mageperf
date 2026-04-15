'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm      from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className=" text-gray-600 mb-4 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // this replaces every <a> in the markdown
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              {...props}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}