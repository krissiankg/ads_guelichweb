import { useState } from 'react';
import { supabase } from './supabase';

export function useDragReorder<T extends { id: string; order_index: number }>(items: T[], table: string) {
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const fromIdx = items.findIndex((i) => i.id === dragId);
    const toIdx = items.findIndex((i) => i.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    
    const updates = reordered.map((item, idx) =>
      supabase.from(table).update({ order_index: idx }).eq('id', item.id)
    );
    await Promise.all(updates);
    setDragId(null);
    window.dispatchEvent(new Event('portfolio-reorder'));
  };

  const moveUp = async (id: string) => {
    const fromIdx = items.findIndex((i) => i.id === id);
    if (fromIdx <= 0) return;
    const toIdx = fromIdx - 1;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    
    const updates = reordered.map((item, idx) =>
      supabase.from(table).update({ order_index: idx }).eq('id', item.id)
    );
    await Promise.all(updates);
    window.dispatchEvent(new Event('portfolio-reorder'));
  };

  const moveDown = async (id: string) => {
    const fromIdx = items.findIndex((i) => i.id === id);
    if (fromIdx === -1 || fromIdx === items.length - 1) return;
    const toIdx = fromIdx + 1;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    
    const updates = reordered.map((item, idx) =>
      supabase.from(table).update({ order_index: idx }).eq('id', item.id)
    );
    await Promise.all(updates);
    window.dispatchEvent(new Event('portfolio-reorder'));
  };

  return { dragId, onDragStart, onDragOver, onDrop, moveUp, moveDown };
}
