import React, { useState } from 'react';
import { Download, Eye, FileText, File, Image, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { ComplaintAttachment } from '@/types';
import { complaintApi } from '@/lib/api';

interface AttachmentViewerProps {
  attachments: ComplaintAttachment[];
  complaintId: number;
}

type ViewerMode = 'image' | 'pdf' | null;

interface ViewerState {
  mode: ViewerMode;
  attachment: ComplaintAttachment | null;
  imageIndex: number;
}

const BYTE_SIZES = ['B', 'KB', 'MB', 'GB'];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${BYTE_SIZES[i]}`;
}

function getFileCategory(contentType: string): 'image' | 'pdf' | 'other' {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  return 'other';
}

function FileIcon({ contentType, className = 'h-8 w-8' }: { contentType: string; className?: string }) {
  const category = getFileCategory(contentType);
  if (category === 'image') return <Image className={`${className} text-blue-500`} />;
  if (category === 'pdf') return <FileText className={`${className} text-red-500`} />;
  return <File className={`${className} text-gray-400`} />;
}

function getFileTypeLabel(contentType: string): string {
  if (contentType.startsWith('image/')) return contentType.replace('image/', '').toUpperCase();
  if (contentType === 'application/pdf') return 'PDF';
  const parts = contentType.split('/');
  return parts[parts.length - 1].toUpperCase();
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ attachments, complaintId }) => {
  const [viewer, setViewer] = useState<ViewerState>({ mode: null, attachment: null, imageIndex: 0 });
  const [downloading, setDownloading] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const imageAttachments = attachments.filter(a => getFileCategory(a.contentType) === 'image');

  const openViewer = (attachment: ComplaintAttachment) => {
    const category = getFileCategory(attachment.contentType);
    if (category === 'image') {
      const imageIndex = imageAttachments.findIndex(a => a.attachmentId === attachment.attachmentId);
      setViewer({ mode: 'image', attachment, imageIndex });
      setZoomLevel(1);
    } else if (category === 'pdf') {
      setViewer({ mode: 'pdf', attachment, imageIndex: 0 });
    }
  };

  const closeViewer = () => {
    setViewer({ mode: null, attachment: null, imageIndex: 0 });
    setZoomLevel(1);
  };

  const prevImage = () => {
    const newIndex = (viewer.imageIndex - 1 + imageAttachments.length) % imageAttachments.length;
    setViewer(prev => ({
      ...prev,
      attachment: imageAttachments[newIndex],
      imageIndex: newIndex,
    }));
    setZoomLevel(1);
  };

  const nextImage = () => {
    const newIndex = (viewer.imageIndex + 1) % imageAttachments.length;
    setViewer(prev => ({
      ...prev,
      attachment: imageAttachments[newIndex],
      imageIndex: newIndex,
    }));
    setZoomLevel(1);
  };

  const handleDownload = async (attachment: ComplaintAttachment) => {
    setDownloading(attachment.attachmentId);
    try {
      await complaintApi.downloadAttachment(complaintId, attachment.attachmentId, attachment.originalFileName);
    } catch {
      // fallback: open S3 URL
      window.open(attachment.s3Url, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <File className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">ไม่มีไฟล์แนบ</p>
      </div>
    );
  }

  return (
    <>
      {/* Attachment Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {attachments.map(attachment => {
          const category = getFileCategory(attachment.contentType);
          const canPreview = category === 'image' || category === 'pdf';
          const isDownloading = downloading === attachment.attachmentId;

          return (
            <div
              key={attachment.attachmentId}
              className="group relative flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail / Preview Area */}
              <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '120px' }}>
                {category === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.s3Url}
                    alt={attachment.originalFileName}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <FileIcon contentType={attachment.contentType} className="h-12 w-12 opacity-60" />
                )}

                {/* Hover overlay */}
                {canPreview && (
                  <button
                    onClick={() => openViewer(attachment)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    title="ดูตัวอย่าง"
                  >
                    <Eye className="h-7 w-7 text-white drop-shadow" />
                  </button>
                )}

                {/* File type badge */}
                <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold bg-white/90 text-gray-600 rounded px-1.5 py-0.5 shadow-sm border border-gray-100">
                  {getFileTypeLabel(attachment.contentType)}
                </span>
              </div>

              {/* File Info */}
              <div className="flex flex-col gap-1 p-2.5">
                <p className="text-xs font-medium text-gray-800 truncate leading-tight" title={attachment.originalFileName}>
                  {attachment.originalFileName}
                </p>
                <p className="text-[11px] text-gray-400">{formatFileSize(attachment.fileSize)}</p>

                {/* Action Buttons */}
                <div className="flex gap-1.5 mt-1">
                  {canPreview && (
                    <button
                      onClick={() => openViewer(attachment)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg py-1.5 transition-colors font-medium"
                    >
                      <Eye className="h-3 w-3" />
                      ดู
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(attachment)}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg py-1.5 transition-colors font-medium disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    โหลด
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Lightbox Modal */}
      {viewer.mode === 'image' && viewer.attachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={closeViewer}
        >
          {/* Close button */}
          <button
            onClick={closeViewer}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Zoom controls */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
              className="text-white/80 hover:text-white transition-colors"
              title="ย่อ"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-white text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
              className="text-white/80 hover:text-white transition-colors"
              title="ขยาย"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation prev */}
          {imageAttachments.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prevImage(); }}
              className="absolute left-3 sm:left-6 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center overflow-auto" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewer.attachment.s3Url}
              alt={viewer.attachment.originalFileName}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
              className="object-contain rounded-lg shadow-2xl max-w-[90vw] max-h-[80vh]"
            />
          </div>

          {/* Navigation next */}
          {imageAttachments.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); nextImage(); }}
              className="absolute right-3 sm:right-6 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Bottom bar: filename + download */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 text-white rounded-full px-4 py-2 text-sm max-w-[80vw]"
            onClick={e => e.stopPropagation()}
          >
            <span className="truncate max-w-xs">{viewer.attachment.originalFileName}</span>
            {imageAttachments.length > 1 && (
              <span className="text-white/60 text-xs whitespace-nowrap">
                {viewer.imageIndex + 1} / {imageAttachments.length}
              </span>
            )}
            <button
              onClick={() => handleDownload(viewer.attachment!)}
              className="text-white/80 hover:text-white ml-1"
              title="ดาวน์โหลด"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewer.mode === 'pdf' && viewer.attachment && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-5 w-5 text-red-400 shrink-0" />
              <span className="text-sm font-medium truncate">{viewer.attachment.originalFileName}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatFileSize(viewer.attachment.fileSize)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownload(viewer.attachment!)}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                ดาวน์โหลด
              </button>
              <button
                onClick={closeViewer}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* PDF Embed */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${viewer.attachment.s3Url}#toolbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={viewer.attachment.originalFileName}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AttachmentViewer;
