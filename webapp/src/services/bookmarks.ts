/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BookmarkItem {
  id: string;
  type: 'response' | 'lecture' | 'transcript' | 'conversation';
  title: string;
  description?: string;
  createdAt: string;
  classId?: string;
  className?: string;
  metadata: {
    messageId?: string;
    content?: string;
    lectureId?: string;
    lectureName?: string;
    segmentIndex?: number;
    timestamp?: number;
    timestampText?: string;
    conversationId?: string;
  };
}

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('cb_user_data');
    if (raw) {
      const user = JSON.parse(raw);
      return user.id || null;
    }
  } catch {}
  return null;
}

function getBookmarksKey(): string {
  const uid = getCurrentUserId();
  return uid ? `cb_premium_bookmarks_${uid}` : 'cb_premium_bookmarks_preauth';
}

export const BookmarkService = {
  getBookmarks: (): BookmarkItem[] => {
    try {
      const cached = localStorage.getItem(getBookmarksKey());
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  saveBookmarks: (bookmarks: BookmarkItem[]): void => {
    try {
      localStorage.setItem(getBookmarksKey(), JSON.stringify(bookmarks));
      // Dispatch custom event to notify other screens
      window.dispatchEvent(new CustomEvent('cb-bookmarks-changed'));
    } catch (e) {
      console.error('Error saving bookmarks', e);
    }
  },

  addBookmark: (item: Omit<BookmarkItem, 'id' | 'createdAt'>): BookmarkItem => {
    const bookmarks = BookmarkService.getBookmarks();
    const newItem: BookmarkItem = {
      ...item,
      id: `bm_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    // Avoid duplicates
    const exists = bookmarks.find(b => {
      if (b.type !== item.type) return false;
      if (item.type === 'response') {
        return b.metadata.messageId === item.metadata.messageId;
      }
      if (item.type === 'lecture') {
        return b.metadata.lectureId === item.metadata.lectureId;
      }
      if (item.type === 'transcript') {
        return b.metadata.lectureId === item.metadata.lectureId && b.metadata.segmentIndex === item.metadata.segmentIndex;
      }
      if (item.type === 'conversation') {
        return b.metadata.conversationId === item.metadata.conversationId;
      }
      return false;
    });

    if (!exists) {
      bookmarks.push(newItem);
      BookmarkService.saveBookmarks(bookmarks);
    }
    return exists || newItem;
  },

  removeBookmark: (id: string): void => {
    const bookmarks = BookmarkService.getBookmarks();
    const updated = bookmarks.filter(b => b.id !== id);
    BookmarkService.saveBookmarks(updated);
  },

  removeBookmarkByMetadata: (type: BookmarkItem['type'], metaKey: string, metaValue: any): void => {
    const bookmarks = BookmarkService.getBookmarks();
    const updated = bookmarks.filter(b => {
      if (b.type !== type) return true;
      return (b.metadata as any)[metaKey] !== metaValue;
    });
    BookmarkService.saveBookmarks(updated);
  },

  isBookmarked: (type: BookmarkItem['type'], metaKey: string, metaValue: any): boolean => {
    const bookmarks = BookmarkService.getBookmarks();
    return bookmarks.some(b => b.type === type && (b.metadata as any)[metaKey] === metaValue);
  }
};
