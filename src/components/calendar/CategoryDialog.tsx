'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCreateCategory: (data: { name: string; color: string; icon?: string }) => Promise<void>;
  onUpdateCategory: (id: string, data: { name?: string; color?: string; icon?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

export function CategoryDialog({
  open,
  onOpenChange,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onCreateCategory({ name: newName.trim(), color: newColor });
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setIsAdding(false);
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await onUpdateCategory(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleDelete = async (id: string) => {
    await onDeleteCategory(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>카테고리 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category list */}
          <div className="space-y-2">
            {categories.length === 0 && !isAdding && (
              <p className="text-sm text-muted-foreground text-center py-4">
                등록된 카테고리가 없습니다
              </p>
            )}

            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 p-2 rounded-md border"
              >
                {editingId === category.id ? (
                  // Edit mode
                  <>
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-primary"
                      style={{ backgroundColor: editColor }}
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleSaveEdit}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  // View mode
                  <>
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-sm">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStartEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new category form */}
          {isAdding ? (
            <div className="space-y-3 p-3 rounded-md border bg-muted/50">
              <div className="grid gap-2">
                <Label>카테고리 이름</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 학교, 운동, 가족"
                  className="h-10"
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <Label>색상</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAdding(false);
                    setNewName('');
                    setNewColor(PRESET_COLORS[0]);
                  }}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                >
                  추가
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              카테고리 추가
            </Button>
          )}

          {/* Color picker for editing */}
          {editingId && (
            <div className="p-3 rounded-md border bg-muted/50">
              <Label className="mb-2 block">색상 변경</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-7 h-7 rounded-full transition-transform ${
                      editColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
