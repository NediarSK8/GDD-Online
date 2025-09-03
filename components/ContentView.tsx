import React, { useEffect, useMemo } from 'react';
import { Document, ContentBlock, ImageBlock } from '../types';

interface ContentViewProps {
  document: Document | null;
  allDocuments: Document[];
  onNavigate: (documentId: string, headingSlug?: string) => void;
  scrollToHeading: string | null;
  onDidScrollToHeading: () => void;
}

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-300">Welcome to the GDD Viewer</h2>
        <p className="mt-2 max-w-md">Select a document from the sidebar to view its content.</p>
    </div>
);

const slugify = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
};

export const ContentView: React.FC<ContentViewProps> = ({ document, allDocuments, onNavigate, scrollToHeading, onDidScrollToHeading }) => {

  useEffect(() => {
    if (scrollToHeading && document) {
        const element = window.document.getElementById(scrollToHeading);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.classList.add('highlight-scroll');
            setTimeout(() => {
                element.classList.remove('highlight-scroll');
            }, 2000); // Highlight for 2 seconds
        }
        onDidScrollToHeading(); // Clear the state so it doesn't scroll again
    }
  }, [scrollToHeading, document, onDidScrollToHeading]);

  const { docTitleMap, headingMap } = useMemo(() => {
      const docTitleMap = new Map<string, string>();
      const headingMap = new Map<string, { docId: string, slug: string }>();

      allDocuments.forEach(doc => {
          docTitleMap.set(doc.title.toLowerCase(), doc.id);
          doc.content.forEach(block => {
              if (block.type === 'heading' && block.text) {
                  if (!headingMap.has(block.text.toLowerCase())) {
                      headingMap.set(block.text.toLowerCase(), {
                          docId: doc.id,
                          slug: slugify(block.text),
                      });
                  }
              }
          });
      });

      return { docTitleMap, headingMap };
  }, [allDocuments]);

  const renderInline = (text: string | undefined): (JSX.Element | string)[] => {
      if (!text) return [];
      const parts = text.split(/(\[\[.*?\]\])/g).filter(Boolean);

      return parts.map((part, index) => {
          if (part.startsWith('[[') && part.endsWith(']]')) {
              const content = part.slice(2, -2);

              if (content.startsWith('img:')) {
                  const imgId = content.substring(4);
                  const imageBlock = document?.content.find(b => b.type === 'image' && b.id === imgId) as ImageBlock | undefined;
                  if (imageBlock) {
                      return (
                          <span
                              key={index}
                              className="text-green-400 font-semibold hover:underline bg-green-900/30 px-1 py-0.5 rounded-sm transition-colors cursor-pointer"
                          >
                              {`img:${imgId.slice(-4)}`}
                          </span>
                      );
                  } else {
                      return <span key={index} className="text-red-400 line-through px-1" title={`Imagem não encontrada: "${imgId}"`}>{imgId}</span>;
                  }
              }

              let docTitle = content;
              let headingText: string | undefined = undefined;

              if (content.includes('#')) {
                  [docTitle, headingText] = content.split('#', 2);
              }

              const docId = docTitleMap.get(docTitle.toLowerCase());
              if (docId) {
                  const slug = headingText ? slugify(headingText) : undefined;
                  return <button key={index} onClick={() => onNavigate(docId, slug)} className="text-indigo-400 font-semibold hover:underline bg-indigo-900/30 px-1 py-0.5 rounded-sm transition-colors">{content}</button>;
              }

              if (!headingText) {
                  const headingMatch = headingMap.get(docTitle.toLowerCase());
                  if (headingMatch) {
                      return <button key={index} onClick={() => onNavigate(headingMatch.docId, headingMatch.slug)} className="text-indigo-400 font-semibold hover:underline bg-indigo-900/30 px-1 py-0.5 rounded-sm transition-colors">{content}</button>;
                  }
              }
              
              return <span key={index} className="text-red-400 line-through px-1" title={`Link não encontrado: "${content}"`}>{content}</span>;
          }
          return part;
      });
  };
  
  if (!document) {
    return <WelcomeScreen />;
  }

  return (
    <div className="p-8 lg:p-12 prose prose-invert prose-lg max-w-4xl mx-auto relative">
      <div className="mb-8 pb-4 border-b border-gray-700">
        <p className="text-indigo-400 font-semibold">{document.category}</p>
        <h1 className="text-4xl font-extrabold text-white !mb-0">{document.title}</h1>
      </div>
      <div className="text-gray-300 leading-relaxed">
        {Array.isArray(document.content) && document.content.map((block: ContentBlock, index) => {
            if (!block) {
                return null;
            }
            
            switch (block.type) {
                case 'heading': {
                    const slug = slugify(block.text);
                    const commonProps = { id: slug, 'data-block-index': index, className: 'scroll-mt-24' };
                    switch (block.level) {
                        case 1: return <h2 key={index} {...commonProps} className={`${commonProps.className} text-indigo-400 border-b border-gray-700 pb-2 text-2xl font-bold`}>{renderInline(block.text)}</h2>;
                        case 2: return <h3 key={index} {...commonProps} className={`${commonProps.className} text-xl font-semibold text-gray-200 mt-8 mb-2`}>{renderInline(block.text)}</h3>;
                        case 3: return <h4 key={index} {...commonProps} className={`${commonProps.className} text-lg font-medium text-gray-300 mt-6 mb-1`}>{renderInline(block.text)}</h4>;
                        default: return <h2 key={index} {...commonProps} className={`${commonProps.className} text-indigo-400 border-b border-gray-700 pb-2 text-2xl font-bold`}>{renderInline(block.text)}</h2>;
                    }
                }
                case 'paragraph': {
                    return (
                        <p key={index} data-block-index={index}>{renderInline(block.text)}</p>
                    );
                }
                case 'list': {
                    if (!Array.isArray(block.items)) return null;
                    const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
                    return (
                        <ListTag key={index} data-block-index={index}>
                            {block.items.map((item, itemIndex) => (
                                <li key={itemIndex} data-item-index={itemIndex}>
                                    {renderInline(item)}
                                </li>
                            ))}
                        </ListTag>
                    );
                }
                case 'image': {
                    return (
                        <figure key={index} id={block.id} data-block-index={index} className="my-6 not-prose">
                            <img src={block.src} alt={block.caption} className="w-full rounded-md shadow-lg" />
                            <figcaption className="text-center text-sm italic text-gray-400 mt-2">{renderInline(block.caption)}</figcaption>
                        </figure>
                    );
                }
                default:
                    return null;
            }
        })}
      </div>
    </div>
  );
};
