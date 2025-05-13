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
import { policiesTermsData, policyInfoCardData } from '@/data/policies-terms';
import PageTitle from '@/components/common/page-title';
import PoliciesInfoCard from '@/components/policies-terms/policies-info-card';

const iconMap = {
  FileText,
  Lock,
  Users,
  Shield,
} as const;

type IconKey = keyof typeof iconMap;

export default function PoliciesTermsPage() {
  const policies = policiesTermsData;

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
                      <Icon className="text-primary/50 h-5 w-5" />
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
                          <h2 className="text-primary mb-2 text-xl font-semibold">
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
          {policyInfoCardData.map((card, index) => (
            <PoliciesInfoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
