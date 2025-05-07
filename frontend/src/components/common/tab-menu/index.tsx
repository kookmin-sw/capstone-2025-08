import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabItem } from '@/types/annotation-sidebar';

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  bgColor?: string;
}

const tabTriggerClass =
  'h-full rounded-b-none rounded-t-sm px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white cursor-pointer';

export default function TabMenu({
  tabs,
  defaultValue,
  bgColor = 'border',
}: TabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      className="flex h-full gap-0"
    >
      <TabsList className="h-8 w-full flex-nowrap bg-white p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={tabTriggerClass}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div
        className={`bg-${bgColor} border-accent-foreground h-full overflow-y-auto border-t p-4`}
      >
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
