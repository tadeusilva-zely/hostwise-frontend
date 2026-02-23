import { Sparkles } from 'lucide-react';
import type { ChatMessageData } from '../../services/api';

interface ChatMessageProps {
  message: ChatMessageData;
}

/** Parse inline markdown (**bold**, *italic*) into React elements */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index}>{match[3]}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'USER';

  return (
    <div className={`flex gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className="rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff',
                borderBottomRightRadius: '6px',
              }
            : {
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-secondary)',
                borderBottomLeftRadius: '6px',
              }
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="space-y-1">
            {message.content.split('\n').map((line, i) => {
              // Headings: ### or ##
              if (/^#{1,3}\s+/.test(line)) {
                return (
                  <p key={i} className="font-semibold mt-2 first:mt-0" style={{ color: 'var(--text-primary)' }}>
                    {parseInline(line.replace(/^#{1,3}\s+/, ''))}
                  </p>
                );
              }
              // Bullet list
              if (line.startsWith('- ') || line.startsWith('• ') || /^\*\s+/.test(line)) {
                const content = line.replace(/^[-•*]\s+/, '');
                return (
                  <p key={i} className="pl-3 relative before:content-['•'] before:absolute before:left-0" style={{ '--tw-content': '"•"' } as React.CSSProperties}>
                    <span style={{ color: '#818cf8', position: 'absolute', left: 0 }}>•</span>
                    <span style={{ paddingLeft: '12px', display: 'inline-block' }}>{parseInline(content)}</span>
                  </p>
                );
              }
              // Numbered list
              if (/^\d+[.)]\s+/.test(line)) {
                const num = line.match(/^(\d+)[.)]\s+/)![1];
                const content = line.replace(/^\d+[.)]\s+/, '');
                return (
                  <p key={i} className="pl-4 relative">
                    <span className="absolute left-0 font-medium" style={{ color: '#818cf8' }}>{num}.</span>
                    {parseInline(content)}
                  </p>
                );
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{parseInline(line)}</p>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3 justify-start">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div
        className="rounded-2xl rounded-bl-md px-4 py-3"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: 'var(--text-muted)' }} />
          <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: 'var(--text-muted)' }} />
          <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  );
}
