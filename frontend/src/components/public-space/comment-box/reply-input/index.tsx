'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ReplyInput({
  onPost,
  onCancel,
}: {
  onPost: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState('');

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Write a reply"
        className="w-full"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          onClick={() => {
            onPost(text);
            setText('');
          }}
        >
          Post Reply
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
