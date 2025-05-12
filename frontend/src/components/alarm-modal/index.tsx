'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AlarmModal({ open, onClose }: DeleteModalProps) {
  const router = useRouter();

  const alarmList = [
    {
      id: 1,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: false,
    },
    {
      id: 2,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: false,
    },
    {
      id: 3,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 4,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 5,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 6,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 7,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 8,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 9,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
    {
      id: 10,
      title: 'File upload completed',
      description: 'File upload completed. Try annotating it.',
      time: '1 minute ago',
      url: '/main/projects',
      isSeen: true,
    },
  ];

  return (
    <div className="absolute top-0">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alarm</DialogTitle>
            <div className="my-2 border-b" />
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {alarmList.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer py-5"
                onClick={() => {
                  router.push(item.url);
                  onClose();
                }}
              >
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{item.title}</CardTitle>
                      {item.isSeen && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>

                    <div className="text-muted-foreground text-sm">
                      {item.time}
                    </div>
                  </div>

                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
