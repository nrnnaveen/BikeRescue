import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getUserNotifications,
  getShopNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/db/notifications';
import { getShopByUserId } from '@/lib/db/shops';
import { Notification } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    let notifications: Notification[] = [];
    if (user.role === 'SHOP') {
      const shop = getShopByUserId(user.id);
      if (shop) {
        notifications = getShopNotifications(shop.id);
      }
    } else {
      notifications = getUserNotifications(user.id);
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      if (user.role === 'SHOP') {
        const shop = getShopByUserId(user.id);
        if (shop) markAllNotificationsAsRead(undefined, shop.id);
      } else {
        markAllNotificationsAsRead(user.id, undefined);
      }
      return NextResponse.json({ success: true });
    }

    if (id) {
      markNotificationAsRead(parseInt(id, 10));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications.' },
      { status: 500 }
    );
  }
}
