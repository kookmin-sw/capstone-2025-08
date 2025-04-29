import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsProps } from '@/types/tap-menu';

const tabTriggerClass =
  'h-full rounded-b-none rounded-t-sm px-4 py-2 text-sm data-[state=active]:bg-black data-[state=active]:text-white';

export default function TabMenu({
  tabs,
  defaultValue,
  height = '60%',
}: TabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      className={`h-[${height}] gap-0`}
    >
      <TabsList className="h-8 w-full bg-white p-0">
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

      <div className="bg-border border-accent-foreground h-full overflow-y-scroll border-t p-4">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
