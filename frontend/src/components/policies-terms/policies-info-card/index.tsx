import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface PoliciesInfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  haveButton?: boolean;
}

export default function PoliciesInfoCard({
  icon: Icon,
  title,
  description,
  haveButton = false,
}: PoliciesInfoCardProps) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-3">
            <Icon className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="mb-2 font-semibold">{title}</h3>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          {haveButton && (
            <Button asChild size="sm">
              <Link href="/main/docs-help">Contact Us</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
