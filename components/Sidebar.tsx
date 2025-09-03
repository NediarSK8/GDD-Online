import React, { useState } from 'react';
import { Document, HeadingBlock } from '../types';
import { SearchResult } from '../App';

type ViewMode = 'gdd' | 'script';

interface SidebarProps {
  title: string;
  documents: Document[];
  categories: string[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  totalWordCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  onSelectSearchResult: (docId: string, viewMode: ViewMode) => void;
}

const slugify = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
};

const formatTimestamp = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        }).format(date);
    } catch (e) {
        return '';
    }
};

const ChevronIcon: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ClearIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
    title, documents, categories, activeDocumentId, 
    onSelectDocument,
    totalWordCount, searchQuery, onSearchChange, searchResults, onSelectSearchResult
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isHeadingsCollapsed, setIsHeadingsCollapsed] = useState<boolean>(false);

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName],
    }));
  };
  
  const handleDocumentClick = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    const hasHeadings = doc?.content.some(block => block.type === 'heading');

    if (activeDocumentId === docId) {
      if (hasHeadings) {
        setIsHeadingsCollapsed(prev => !prev);
      }
    } else {
      onSelectDocument(docId);
      setIsHeadingsCollapsed(false); // Always expand when selecting a new document
    }
  };

  return (
    <aside className="w-80 bg-gray-800 text-white flex flex-col h-full border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <div className="relative text-gray-400 focus-within:text-gray-100">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="Pesquisar documentos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
                <button 
                    onClick={() => onSearchChange('')} 
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="Clear search"
                >
                    <ClearIcon />
                </button>
            )}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {searchQuery ? (
          <div>
            {searchResults.length > 0 ? (
                <ul className="space-y-2">
                    {searchResults.map(result => (
                        <li key={result.docId}>
                            <button onClick={() => onSelectSearchResult(result.docId, result.viewMode)} className="w-full text-left p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <div className="font-semibold text-indigo-400">{result.docTitle}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{result.category} ({result.viewMode.toUpperCase()})</div>
                                <div className="space-y-1 text-sm text-gray-400 italic">
                                    {result.snippets.slice(0, 3).map((snippet, i) => (
                                        <div key={i} className="truncate text-ellipsis">
                                            {snippet}
                                        </div>
                                    ))}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-gray-500 p-4">Nenhum resultado encontrado.</div>
            )}
          </div>
        ) : (
          categories.map(category => {
            const categoryDocuments = documents.filter(doc => doc.category === category);
            if (categoryDocuments.length === 0) return null;

            const isCollapsed = !!collapsedCategories[category];

            return (
              <div key={category}>
                <div className="group flex items-center justify-between mb-2 rounded-md">
                    <button 
                        onClick={() => toggleCategory(category)}
                        className="flex items-center flex-grow text-left text-sm font-bold text-indigo-400 uppercase tracking-wider p-1 -ml-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
                        aria-expanded={!isCollapsed}
                        aria-controls={`category-section-${slugify(category)}`}
                    >
                        <ChevronIcon isCollapsed={isCollapsed} />
                        <span className="ml-1 group-hover:text-indigo-300 transition-colors">{category}</span>
                    </button>
                </div>
                {!isCollapsed && (
                  <ul id={`category-section-${slugify(category)}`} className="space-y-1 pl-4 border-l border-gray-600 ml-1.5">
                      {categoryDocuments.map(doc => {
                          const isActive = activeDocumentId === doc.id;
                          const hasHeadings = doc.content.some(block => block.type === 'heading');

                          return (
                              <li key={doc.id} className="rounded-md">
                                  <div className={`group flex items-center justify-between w-full pr-1 transition-colors duration-200 rounded-md ${
                                      isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'
                                  }`}>
                                      <button
                                          onClick={() => handleDocumentClick(doc.id)}
                                          className={`flex items-start flex-grow text-left px-3 py-2 text-sm w-full rounded-l-md ${
                                              isActive
                                              ? 'font-semibold'
                                              : 'text-gray-300 group-hover:text-white'
                                          }`}
                                          aria-expanded={isActive && hasHeadings ? !isHeadingsCollapsed : undefined}
                                          aria-controls={isActive && hasHeadings ? `doc-headings-${doc.id}` : undefined}
                                      >
                                          <span className="w-4 mr-1 flex-shrink-0 mt-1">
                                              {isActive && hasHeadings && <ChevronIcon isCollapsed={isHeadingsCollapsed} />}
                                          </span>
                                          <div className="flex-grow">
                                              <span className="block truncate" title={doc.title}>{doc.title}</span>
                                              {isActive && doc.lastEdited && (
                                                  <div className="text-xs font-normal text-indigo-200/80 -mt-0.5">
                                                      {formatTimestamp(doc.lastEdited)}
                                                  </div>
                                              )}
                                          </div>
                                      </button>
                                  </div>
                                  {isActive && hasHeadings && !isHeadingsCollapsed && (
                                  <ul id={`doc-headings-${doc.id}`} className="pl-4 mt-1 space-y-1 border-l border-gray-600 ml-3">
                                      {doc.content
                                      .filter((block): block is HeadingBlock => block.type === 'heading')
                                      .map((headingBlock, index) => {
                                          const slug = slugify(headingBlock.text);
                                          const getIndentClass = (level: 1 | 2 | 3 | undefined) => {
                                              switch (level) {
                                                  case 1: return 'pl-3';
                                                  case 2: return 'pl-6';
                                                  case 3: return 'pl-9';
                                                  default: return 'pl-3';
                                              }
                                          };
                                          return (
                                              <li key={`${doc.id}-heading-${index}`}>
                                              <a
                                                  href={`#${slug}`}
                                                  onClick={(e) => {
                                                  e.preventDefault();
                                                  const element = document.getElementById(slug);
                                                  if (element) {
                                                      element.scrollIntoView({ behavior: 'smooth' });
                                                  }
                                                  }}
                                                  className={`block w-full text-left py-1 text-xs text-gray-400 hover:bg-gray-700 hover:text-white rounded-md transition-colors ${getIndentClass(headingBlock.level)}`}
                                              >
                                                  {headingBlock.text}
                                              </a>
                                              </li>
                                          );
                                      })}
                                  </ul>
                                  )}
                              </li>
                          )
                      })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </nav>
      <footer className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
              <div className="font-semibold uppercase tracking-wider">Tamanho Total</div>
              <div className="text-lg font-bold text-white">{totalWordCount.toLocaleString('pt-BR')} palavras</div>
          </div>
      </footer>
    </aside>
  );
};
