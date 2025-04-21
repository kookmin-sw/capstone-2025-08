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

interface SearchBarProps {
  sort: string;
  sortOptions: { value: string; label: string }[];
  onSortChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  recentKeywords: string[];
  onRemoveKeyword: (keyword: string) => void;
}

export default function SearchBar({
  sort,
  sortOptions,
  onSortChange,
  searchTerm,
  onSearchTermChange,
  onSearch,
  recentKeywords,
  onRemoveKeyword,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="text-muted-foreground w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search Projects"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
        />

        <Button className="w-32" onClick={onSearch}>
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {recentKeywords.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {keyword}
            <button
              onClick={() => onRemoveKeyword(keyword)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
