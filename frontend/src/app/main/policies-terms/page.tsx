import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  FileText,
  Lock,
  Users,
  CheckCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { policiesTermsData } from '@/data/policies-terms';
import PageTitle from '@/components/common/page-title';

const iconMap = {
  FileText,
  Lock,
  Users,
  Shield,
} as const;

type IconKey = keyof typeof iconMap;

export default function PoliciesTermsPage() {
  const policies = policiesTermsData;

  if (!policies)
    return <div className="p-12 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <PageTitle title={'Policies & Terms'} />

      <div>
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4">
            {Object.entries(policies).map(([key, policy]) => (
              <TabsTrigger key={key} value={key}>
                {policy.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(policies).map(([key, policy]) => {
            const Icon = iconMap[policy.icon as IconKey] || FileText;

            return (
              <TabsContent key={key} value={key}>
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader className="[.border-b]:pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle>{policy.title}</CardTitle>
                        <CardDescription>
                          Last updated: {policy.lastUpdated}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      {policy.sections.map((section, idx) => (
                        <div key={idx} className="mb-8">
                          <h2 className="mb-2 text-xl font-semibold text-gray-800">
                            {section.heading}
                          </h2>
                          <p className="text-gray-600">{section.body}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-3">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-2 font-semibold">Policy Updates</h3>
                <p className="text-sm text-gray-600">
                  We regularly review and update our policies to ensure they
                  remain current with the latest regulations and best practices.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-2 font-semibold">Compliance</h3>
                <p className="text-sm text-gray-600">
                  PathOs is compliant with HIPAA, GDPR, and other relevant
                  regulations to ensure the highest standards of data
                  protection.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-3">
                  <HelpCircle className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-2 font-semibold">Questions?</h3>
                <p className="mb-4 text-sm text-gray-600">
                  If you have any questions about our policies or terms, our
                  team is here to help.
                </p>
                <Button asChild size="sm">
                  <Link href="/main/docs-help">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
