export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  text: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface ListBlock {
  type: 'list';
  style: 'unordered' | 'ordered';
  items: string[];
}

export interface ImageBlock {
  type: 'image';
  id: string;
  src: string; // base64 data URI
  caption: string;
}

export type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | ImageBlock;

export interface Document {
  id: string;
  title: string;
  category: string;
  content: ContentBlock[];
  lastEdited: string;
}
