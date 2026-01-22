'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, ImagePlus, X, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  aiParse,
  aiConfirm,
  aiCancel,
  type ParsedEvent,
  type AIParseResponse,
} from '@/lib/api';

interface AIScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type DialogState = 'input' | 'loading' | 'preview' | 'confirming' | 'success' | 'error';

export function AIScheduleDialog({
  open,
  onOpenChange,
  onSuccess,
}: AIScheduleDialogProps) {
  const [state, setState] = useState<DialogState>('input');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<AIParseResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetDialog = () => {
    setState('input');
    setText('');
    setImagePreview(null);
    setImageBase64(null);
    setParseResult(null);
    setErrorMessage('');
  };

  const handleClose = () => {
    // 미리보기 상태에서 닫으면 취소 처리
    if (parseResult?.pending_id && state === 'preview') {
      aiCancel(parseResult.pending_id);
    }
    resetDialog();
    onOpenChange(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('이미지는 5MB 이하만 가능합니다');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleParse = async () => {
    if (!text.trim() && !imageBase64) {
      setErrorMessage('텍스트를 입력하거나 이미지를 첨부해주세요');
      return;
    }

    setState('loading');
    setErrorMessage('');

    const result = await aiParse(text || undefined, imageBase64 || undefined);

    if (result.success && result.events && result.events.length > 0) {
      setParseResult(result);
      setState('preview');
    } else {
      setErrorMessage(result.error || result.message || '일정을 인식하지 못했습니다');
      setState('error');
    }
  };

  const handleConfirm = async () => {
    if (!parseResult?.pending_id) return;

    setState('confirming');

    const result = await aiConfirm(parseResult.pending_id);

    if (result.success) {
      setState('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || '일정 등록에 실패했습니다');
      setState('error');
    }
  };

  const handleCancel = async () => {
    if (parseResult?.pending_id) {
      await aiCancel(parseResult.pending_id);
    }
    resetDialog();
  };

  const formatEventTime = (event: ParsedEvent) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    if (event.all_day) {
      return format(start, 'M월 d일 (E)', { locale: ko }) + ' 종일';
    }

    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');

    if (isSameDay) {
      return `${format(start, 'M월 d일 (E)', { locale: ko })} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    }

    return `${format(start, 'M월 d일 HH:mm', { locale: ko })} - ${format(end, 'M월 d일 HH:mm', { locale: ko })}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {state === 'input' && 'AI 일정 등록'}
            {state === 'loading' && '일정 분석 중...'}
            {state === 'preview' && '일정 확인'}
            {state === 'confirming' && '등록 중...'}
            {state === 'success' && '등록 완료!'}
            {state === 'error' && '오류'}
          </DialogTitle>
        </DialogHeader>

        {/* Input State */}
        {state === 'input' && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-text">일정 내용</Label>
              <Input
                id="ai-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="예: 내일 오후 3시 치과 예약"
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label>이미지 첨부 (선택)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="첨부 이미지"
                    className="max-h-40 rounded-md object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-20 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-6 w-6 mr-2" />
                  이미지 추가
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                학교 알림장, 포스터 등 이미지에서 일정을 추출합니다
              </p>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">AI가 일정을 분석하고 있습니다...</p>
          </div>
        )}

        {/* Preview State */}
        {state === 'preview' && parseResult?.events && (
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{parseResult.message}</p>
            </div>

            <div className="space-y-3">
              {parseResult.events.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-1"
                >
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventTime(event)}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  {event.recurrence && (
                    <p className="text-xs text-blue-600">반복: {event.recurrence}</p>
                  )}
                </div>
              ))}
            </div>

            {parseResult.expires_at && (
              <p className="text-xs text-muted-foreground text-center">
                {format(new Date(parseResult.expires_at), 'HH:mm', { locale: ko })}까지 유효
              </p>
            )}
          </div>
        )}

        {/* Confirming State */}
        {state === 'confirming' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">일정을 등록하고 있습니다...</p>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-muted-foreground">일정이 등록되었습니다!</p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-600">{errorMessage}</p>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          {state === 'input' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button onClick={handleParse} disabled={!text.trim() && !imageBase64}>
                분석하기
              </Button>
            </>
          )}

          {state === 'preview' && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                다시 입력
              </Button>
              <Button onClick={handleConfirm}>
                등록하기
              </Button>
            </>
          )}

          {state === 'error' && (
            <Button onClick={resetDialog}>
              다시 시도
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
