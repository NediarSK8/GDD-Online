import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentView } from './components/ContentView';
import { Document } from './types';
import { INITIAL_DOCUMENTS, INITIAL_SCRIPT_DOCUMENTS } from './constants';

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 0 1-8.25-8.25V12a8.25 8.25 0 0 1 16.5 0v.75A8.25 8.25 0 0 1 12 21Z" />
    </svg>
);

type ViewMode = 'gdd' | 'script';

export interface SearchResult {
  docId: string;
  docTitle: string;
  category: string;
  viewMode: ViewMode;
  snippets: React.ReactNode[];
}

export default function App() {
  const [documents] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [scriptDocuments] = useState<Document[]>(INITIAL_SCRIPT_DOCUMENTS);

  const [viewMode, setViewMode] = useState<ViewMode>('gdd');
  const [activeGddDocumentId, setActiveGddDocumentId] = useState<string | null>(null);
  const [activeScriptDocumentId, setActiveScriptDocumentId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollToHeading, setScrollToHeading] = useState<string | null>(null);

  // Set initial active document
  useEffect(() => {
    if (documents.length > 0) setActiveGddDocumentId(documents[0].id);
    if (scriptDocuments.length > 0) setActiveScriptDocumentId(scriptDocuments[0].id);
  }, [documents, scriptDocuments]);
  
  const activeDocuments = useMemo(() => (viewMode === 'gdd' ? documents : scriptDocuments) || [], [viewMode, documents, scriptDocuments]);
  const activeDocumentId = useMemo(() => (viewMode === 'gdd' ? activeGddDocumentId : activeScriptDocumentId), [viewMode, activeGddDocumentId, activeScriptDocumentId]);
  const setActiveDocumentId = useMemo(() => (viewMode === 'gdd' ? setActiveGddDocumentId : setActiveScriptDocumentId), [viewMode]);
  
  const totalWordCount = useMemo(() => {
    const countWords = (text: string | undefined | null): number => {
      if (!text) return 0;
      return text.trim().split(/\s+/).filter(Boolean).length;
    };

    return activeDocuments.reduce((total, doc) => {
      let docTotal = countWords(doc.title);
      if (Array.isArray(doc.content)) {
        doc.content.forEach(block => {
          if (block.type === 'heading' || block.type === 'paragraph') {
            docTotal += countWords(block.text);
          } else if (block.type === 'list' && Array.isArray(block.items)) {
            block.items.forEach(item => {
              docTotal += countWords(item);
            });
          } else if (block.type === 'image') {
            docTotal += countWords(block.caption);
          }
        });
      }
      return total + docTotal;
    }, 0);
  }, [activeDocuments]);

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const query = searchQuery.trim().toLowerCase();
    const allDocs = [
        ...((documents || []).map(d => ({ ...d, viewMode: 'gdd' as ViewMode }))),
        ...((scriptDocuments || []).map(d => ({ ...d, viewMode: 'script' as ViewMode })))
    ];

    const createSnippet = (text: string, query: string): React.ReactNode => {
        const index = text.toLowerCase().indexOf(query);
        if (index === -1) return null;

        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + query.length + 40);
        const snippetText = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');

        const regex = new RegExp(`(${searchQuery.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        return (
            <>
                {snippetText.split(regex).map((part, i) =>
                    regex.test(part) ? <mark key={i} className="bg-yellow-400 text-black px-0.5 rounded-sm">{part}</mark> : part
                )}
            </>
        );
    };

    allDocs.forEach(doc => {
        const snippets = new Set<React.ReactNode>();
        
        if (doc.title.toLowerCase().includes(query)) {
            const snippet = createSnippet(doc.title, query);
            if (snippet) snippets.add(snippet);
        }

        doc.content.forEach(block => {
            let texts: string[] = [];
            if ((block.type === 'heading' || block.type === 'paragraph') && block.text) {
                texts.push(block.text);
            } else if (block.type === 'list' && block.items) {
                texts.push(...block.items.filter(Boolean));
            } else if (block.type === 'image' && block.caption) {
                texts.push(block.caption);
            }

            texts.forEach(text => {
                if (text.toLowerCase().includes(query)) {
                    const snippet = createSnippet(text, query);
                    if (snippet) snippets.add(snippet);
                }
            });
        });

        if (snippets.size > 0) {
            results.push({
                docId: doc.id,
                docTitle: doc.title,
                category: doc.category,
                viewMode: doc.viewMode,
                snippets: Array.from(snippets),
            });
        }
    });

    return results;
  }, [searchQuery, documents, scriptDocuments]);

  const activeDocument = useMemo(() => {
    return activeDocuments.find(doc => doc.id === activeDocumentId) || null;
  }, [activeDocumentId, activeDocuments]);

  const categories = useMemo(() => {
    const allCategories = activeDocuments.map(doc => doc.category);
    return [...new Set(allCategories)];
  }, [activeDocuments]);

  const handleSelectDocument = (id: string) => {
    setActiveDocumentId(id);
    setSearchQuery('');
  };

  const handleSelectSearchResult = (docId: string, viewMode: ViewMode) => {
    setViewMode(viewMode);
    if (viewMode === 'gdd') {
        setActiveGddDocumentId(docId);
    } else {
        setActiveScriptDocumentId(docId);
    }
    setSearchQuery('');
  };
  
  const handleNavigate = (id: string, headingSlug?: string) => {
    const targetIsGdd = (documents || []).some(d => d.id === id);
    if (targetIsGdd) {
        setViewMode('gdd');
        setActiveGddDocumentId(id);
    } else {
        setViewMode('script');
        setActiveScriptDocumentId(id);
    }
    setScrollToHeading(headingSlug || null);
  };

  const handleDidScrollToHeading = () => {
    setScrollToHeading(null);
  };

  return (
    <div className="flex h-screen font-sans">
      <Sidebar 
        title={viewMode === 'gdd' ? 'GDD Explorer' : 'Roteiro Explorer'}
        documents={activeDocuments} 
        categories={categories}
        activeDocumentId={activeDocumentId} 
        onSelectDocument={handleSelectDocument}
        totalWordCount={totalWordCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
      />
      <main className="flex-1 flex flex-col bg-gray-900 overflow-y-auto">
         <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
             <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <BrainIcon />
                    GDD Viewer
                </h1>
                <div className="ml-4 bg-gray-800 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setViewMode('gdd')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'gdd' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        GDD
                    </button>
                    <button
                        onClick={() => setViewMode('script')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'script' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Roteiro
                    </button>
                </div>
             </div>
         </header>

         <ContentView 
            document={activeDocument} 
            allDocuments={[...documents, ...scriptDocuments]}
            onNavigate={handleNavigate}
            scrollToHeading={scrollToHeading}
            onDidScrollToHeading={handleDidScrollToHeading}
         />
      </main>
    </div>
  );
}
