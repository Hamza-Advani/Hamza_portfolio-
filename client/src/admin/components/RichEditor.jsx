import { useEffect, useRef } from 'react';
import { EditorContent, Extension, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold, Braces, Code, Heading2, Heading3, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline, Undo2, Unlink, Highlighter,
} from 'lucide-react';
import { uploadToCloudinary } from '../../lib/media.js';
import { useToast } from './Toast.jsx';
import { cx } from '../../lib/format.js';

// Keeps the "author-note" class on paragraphs (used for draft hints in blog posts).
const ParagraphClass = Extension.create({
  name: 'paragraphClass',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          class: {
            default: null,
            parseHTML: (el) => (el.getAttribute('class') === 'author-note' ? 'author-note' : null),
            renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
          },
        },
      },
    ];
  },
});

function Tool({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cx('grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-30', active && 'bg-iris/15 !text-iris')}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange, folder = 'blog' }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const lastEmitted = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      ParagraphClass,
    ],
    content: value || '',
    immediatelyRender: true,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // Keep in sync if the value is replaced from outside (e.g. switching documents).
  useEffect(() => {
    if (editor && value !== lastEmitted.current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
      lastEmitted.current = value;
    }
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
            code: e.isActive('code'), h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }),
            ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), quote: e.isActive('blockquote'), pre: e.isActive('codeBlock'),
            link: e.isActive('link'), undo: e.can().undo(), redo: e.can().redo(),
          }
        : {},
  });

  if (!editor) return null;
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (https://…)', prev);
    if (url === null) return;
    if (url === '') return chain().unsetLink().run();
    if (!/^(https?:|mailto:|\/)/i.test(url)) return toast('Links must start with https://, mailto: or /', 'error');
    chain().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = async (file) => {
    if (!file) return;
    try {
      toast('Uploading image…');
      const asset = await uploadToCloudinary(file, { kind: 'image', folder });
      chain().setImage({ src: asset.url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface-2/40">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-surface/95 p-1.5 backdrop-blur">
        <Tool label="Heading 2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Tool>
        <Tool label="Heading 3" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Tool>
        <span className="mx-1 h-5 w-px bg-line" />
        <Tool label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}><Bold className="h-4 w-4" /></Tool>
        <Tool label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}><Italic className="h-4 w-4" /></Tool>
        <Tool label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()}><Underline className="h-4 w-4" /></Tool>
        <Tool label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Tool>
        <Tool label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()}><Code className="h-4 w-4" /></Tool>
        <span className="mx-1 h-5 w-px bg-line" />
        <Tool label="Bullet list" active={state.ul} onClick={() => chain().toggleBulletList().run()}><List className="h-4 w-4" /></Tool>
        <Tool label="Numbered list" active={state.ol} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Tool>
        <Tool label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Tool>
        <Tool label="Code block" active={state.pre} onClick={() => chain().toggleCodeBlock().run()}><Braces className="h-4 w-4" /></Tool>
        <Tool label="Divider" onClick={() => chain().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Tool>
        <span className="mx-1 h-5 w-px bg-line" />
        <Tool label="Add link" active={state.link} onClick={setLink}><LinkIcon className="h-4 w-4" /></Tool>
        <Tool label="Remove link" disabled={!state.link} onClick={() => chain().unsetLink().run()}><Unlink className="h-4 w-4" /></Tool>
        <Tool label="Insert image" onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" /></Tool>
        <Tool label="Author note (draft hint)" onClick={() => chain().insertContent('<p class="author-note">✍️ Note: </p>').run()}><Highlighter className="h-4 w-4" /></Tool>
        <span className="ml-auto flex">
          <Tool label="Undo" disabled={!state.undo} onClick={() => chain().undo().run()}><Undo2 className="h-4 w-4" /></Tool>
          <Tool label="Redo" disabled={!state.redo} onClick={() => chain().redo().run()}><Redo2 className="h-4 w-4" /></Tool>
        </span>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
      </div>
      <EditorContent editor={editor} className="prose-x max-h-[70vh] overflow-y-auto" />
    </div>
  );
}
