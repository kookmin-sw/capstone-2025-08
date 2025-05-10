'use client';

import React, { useRef, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';

interface MarkdownEditorProps {
  content: string;
  setContent: (value: string) => void;
}

export default function MarkdownEditor({
  content,
  setContent,
}: MarkdownEditorProps) {
  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();

    if (!editorInstance) return;

    const handleChange = () => {
      const markdown = editorInstance.getMarkdown();
      setContent(markdown); // 외부 상태에 실시간 반영
    };

    editorInstance.on('change', handleChange);

    return () => {
      editorInstance.off('change', handleChange);
    };
  }, [setContent]);

  return (
    <Editor
      ref={editorRef}
      initialValue={content}
      previewStyle="tab"
      height="400px"
      initialEditType="wysiwyg"
      useCommandShortcut={true}
      hideModeSwitch={true}
      placeholder={'Input your project description'}
    />
  );
}
