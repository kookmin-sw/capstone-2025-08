'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  type GetNotificationsResponseDto,
  NotificationAPIApi,
} from '@/generated-api';
import { toast } from 'sonner';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AlarmModal({ open, onClose }: DeleteModalProps) {
  const NotificationApi = useMemo(() => new NotificationAPIApi(), []);

  const router = useRouter();

  const [alarmList, setAlarmList] = useState<GetNotificationsResponseDto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notificationRes = await NotificationApi.getNotifications();
        setAlarmList(notificationRes.content ?? []);
      } catch (error) {
        console.error('알림 목록를 불러오는 중 오류 발생:', error);
      }
    };

    fetchData();
  }, []);

  const handleRead = async (notificationId: number) => {
    try {
      await NotificationApi.readNotification({
        notificationId: notificationId,
      });
    } catch (error) {
      toast.error('Failed to fetch notifications.');
    }
  };

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
                  handleRead(item.id ?? -1);
                  router.push(item.redirectPath ?? '');
                  onClose();
                }}
              >
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{item.title}</CardTitle>
                      {!item.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>

                    <div className="text-muted-foreground text-sm">
                      {item.timeAgo}
                    </div>
                  </div>

                  <CardDescription>{item.message}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
