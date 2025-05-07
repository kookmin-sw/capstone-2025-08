'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface SearchBarProps {
  sort?: string;
  sortOptions?: { value: string; label: string }[];
  onSortChange?: (value: string) => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  recentKeywords: string[];
  onRemoveKeyword: (keyword: string) => void;
  showSort?: boolean;
}

export default function SearchBar({
  sort,
  sortOptions,
  onSortChange,
  searchTerm,
  onSearch,
  recentKeywords,
  onRemoveKeyword,
  showSort = true,
}: SearchBarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = () => {
    onSearch(localSearchTerm);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {showSort && (
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          placeholder="Search Projects"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />

        <Button className="w-32" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {recentKeywords.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className="flex items-center gap-2.5"
          >
            {keyword}
            <button
              onClick={() => onRemoveKeyword(keyword)}
              className="text-muted-foreground hover:text-foreground text-sm hover:cursor-pointer"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
