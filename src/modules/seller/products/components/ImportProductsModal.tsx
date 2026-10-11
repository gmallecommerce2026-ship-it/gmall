'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Download, Upload, FileSpreadsheet, FileArchive, X, Loader2, CheckCircle2, AlertCircle, AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';

interface Issue { sheet: string; row: number; product?: string; message: string }
interface Report {
  summary: {
    productRows: number; productGroups: number; validNewProducts: number; validModelTargets: number;
    modelRows: number; modelsToAdd: number; modelsToUpdate: number; modelsSkipped: number;
  };
  errors: Issue[]; warnings: Issue[];
  preview: { type: 'new' | 'models'; name: string; models?: number; images?: number; videos?: number; add?: number; update?: number; skip?: number }[];
}
interface Job {
  id: string; status: 'running' | 'done' | 'failed'; total: number; processed: number;
  created: number; modelsAdded: number; modelsUpdated: number; currentName?: string;
  errors: Issue[]; warnings: Issue[]; fatal?: string;
}
interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void }

type Stage = 'idle' | 'checking' | 'checked' | 'running' | 'done';

const IssueList = ({ items, tone }: { items: Issue[]; tone: 'red' | 'yellow' }) => (
  <div className={`max-h-48 overflow-y-auto border rounded-md divide-y ${tone === 'red' ? 'border-red-200 divide-red-100 bg-red-50 text-red-700' : 'border-yellow-200 divide-yellow-100 bg-yellow-50 text-yellow-800'}`}>
    {items.map((it, i) => (
      <div key={i} className="px-3 py-2 text-xs">
        <b>{it.sheet} · Dòng {it.row}</b>{it.product ? ` · ${it.product}` : ''}: {it.message}
      </div>
    ))}
  </div>
);

const ImportProductsModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [onExisting, setOnExisting] = useState<'skip' | 'update'>('skip');
  const [draft, setDraft] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [report, setReport] = useState<Report | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failRef = useRef(0);

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  if (!isOpen) return null;

  const reset = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setFile(null); setZip(null); setReport(null); setJob(null); setStage('idle');
  };
  const handleClose = () => { reset(); onClose(); };
  const invalidate = () => { setReport(null); setStage('idle'); };

  const buildForm = () => {
    const f = new FormData();
    f.append('file', file as File);
    if (zip) f.append('images', zip);
    f.append('onExisting', onExisting);
    f.append('draft', draft ? '1' : '0');
    return f;
  };
  const errMsg = (e: any) => {
    const m = e?.response?.data?.message;
    return Array.isArray(m) ? m.join('; ') : m || 'Có lỗi khi xử lý file';
  };

  const downloadTemplate = async () => {
    try {
      const blob = await api.get<Blob>('/seller/products/import/template', { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'mau-nhap-san-pham.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Không tải được file mẫu'); }
  };

  const check = async () => {
    if (!file) return;
    setStage('checking');
    try {
      const data = await api.post<Report>('/seller/products/import/validate', buildForm(), { timeout: 120000 });
      setReport(data); setStage('checked');
    } catch (e) { toast.error(errMsg(e)); setStage('idle'); }
  };

  const poll = (jobId: string) => {
    pollRef.current = setTimeout(async () => {
      try {
        const j = await api.get<Job>(`/seller/products/import/jobs/${jobId}`);
        failRef.current = 0;
        setJob(j);
        if (j.status === 'running') poll(jobId);
        else {
          setStage('done');
          if (j.created + j.modelsAdded + j.modelsUpdated > 0) onSuccess();
        }
      } catch {
        if (++failRef.current < 8) poll(jobId);
        else { toast.error('Mất kết nối khi theo dõi tiến trình. Hãy tải lại danh sách sản phẩm để xem kết quả.'); setStage('done'); }
      }
    }, 1500);
  };

  const startImport = async () => {
    if (!file) return;
    setStage('running'); setJob(null); failRef.current = 0;
    try {
      const { jobId } = await api.post<{ jobId: string; total: number }>('/seller/products/import', buildForm(), { timeout: 120000 });
      poll(jobId);
    } catch (e) { toast.error(errMsg(e)); setStage('checked'); }
  };

  const s = report?.summary;
  const importable = (s?.validNewProducts ?? 0) + (s?.validModelTargets ?? 0);
  const pct = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Nhập sản phẩm hàng loạt từ Excel</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {stage !== 'running' && stage !== 'done' && (
            <>
              <div className="flex items-center justify-between gap-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <div className="text-sm text-gray-700">
                  <b>Bước 1:</b> Tải file mẫu. Sheet <b>“Sản phẩm”</b>: tạo mới (dòng cùng tên tự gộp thành model). Sheet <b>“Thêm model”</b>: thêm model vào sản phẩm đã có. Xem sheet “Hướng dẫn”.
                </div>
                <button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-500 text-orange-500 rounded-md hover:bg-orange-100 text-sm font-medium whitespace-nowrap">
                  <Download size={16} /> Tải file mẫu
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-700"><b>Bước 2:</b> Chọn file đã điền</div>
                <input ref={fileRef} type="file" accept=".xlsx" className="hidden"
                  onChange={(e) => { setFile(e.target.files?.[0] ?? null); invalidate(); e.target.value = ''; }} />
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-orange-500 hover:text-orange-500">
                  {file ? <><FileSpreadsheet size={20} /> {file.name}</> : <><Upload size={20} /> Chọn file Excel (.xlsx, tối đa 5MB)</>}
                </button>

                <input ref={zipRef} type="file" accept=".zip" className="hidden"
                  onChange={(e) => { setZip(e.target.files?.[0] ?? null); invalidate(); e.target.value = ''; }} />
                <div className="flex items-center gap-3 text-sm">
                  <button onClick={() => zipRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:border-orange-500 hover:text-orange-500">
                    <FileArchive size={16} /> {zip ? zip.name : 'Đính kèm ZIP ảnh (tuỳ chọn)'}
                  </button>
                  {zip && <button onClick={() => { setZip(null); invalidate(); }} className="text-xs text-gray-500 hover:text-red-500">Bỏ file ZIP</button>}
                  <span className="text-xs text-gray-400">Dùng khi ô ảnh ghi tên file thay vì link.</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 pt-1">
                  <label className="flex items-center gap-2">
                    Model đã tồn tại (sheet “Thêm model”):
                    <select value={onExisting} onChange={(e) => { setOnExisting(e.target.value as any); invalidate(); }}
                      className="border border-gray-300 rounded px-2 py-1 bg-white text-sm">
                      <option value="skip">Bỏ qua</option>
                      <option value="update">Cập nhật giá & tồn kho</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft} onChange={(e) => { setDraft(e.target.checked); invalidate(); }} />
                    Lưu sản phẩm mới ở dạng nháp (không gửi duyệt)
                  </label>
                </div>
              </div>
            </>
          )}

          {report && s && stage !== 'running' && stage !== 'done' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                {report.errors.length === 0 ? <CheckCircle2 size={18} className="text-green-600 mt-0.5" /> : <AlertCircle size={18} className="text-yellow-600 mt-0.5" />}
                <div className="text-gray-800 space-y-1">
                  {s.productRows > 0 && <div>Sheet “Sản phẩm”: {s.productRows} dòng → {s.productGroups} sản phẩm, <b className="text-green-700">{s.validNewProducts} hợp lệ</b>.</div>}
                  {s.modelRows > 0 && <div>Sheet “Thêm model”: {s.modelRows} dòng → {s.validModelTargets} sản phẩm có sẵn sẽ được cập nhật (<b>+{s.modelsToAdd}</b> model mới{s.modelsToUpdate > 0 && <>, ~{s.modelsToUpdate} cập nhật</>}{s.modelsSkipped > 0 && <>, {s.modelsSkipped} bỏ qua</>}).</div>}
                  <div className="text-xs text-gray-500">Bước kiểm tra chỉ xem định dạng ảnh/link. Ảnh lỗi (link chết, quá 5MB…) sẽ hiện thành cảnh báo khi nhập thật.</div>
                </div>
              </div>

              {report.preview.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md divide-y text-xs">
                  {report.preview.map((p, i) => (
                    <div key={i} className="px-3 py-1.5 flex justify-between gap-3">
                      <span className="truncate"><b className={p.type === 'new' ? 'text-green-700' : 'text-blue-700'}>{p.type === 'new' ? 'MỚI' : 'THÊM MODEL'}</b> · {p.name}</span>
                      <span className="text-gray-500 whitespace-nowrap">
                        {p.type === 'new' ? `${p.models} model · ${p.images} ảnh · ${p.videos} video` : `+${p.add} · ~${p.update} · bỏ qua ${p.skip}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {report.errors.length > 0 && <><div className="text-xs font-semibold text-red-600">Lỗi ({report.errors.length}) — dòng lỗi sẽ bị bỏ qua:</div><IssueList items={report.errors} tone="red" /></>}
              {report.warnings.length > 0 && <><div className="text-xs font-semibold text-yellow-700">Cảnh báo ({report.warnings.length}):</div><IssueList items={report.warnings} tone="yellow" /></>}
            </div>
          )}

          {(stage === 'running' || stage === 'done') && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>
                    {stage === 'running'
                      ? <>Đang xử lý{job?.currentName ? <>: <b>{job.currentName}</b></> : '...'}</>
                      : job?.status === 'failed' ? 'Tiến trình dừng giữa chừng' : 'Hoàn tất'}
                  </span>
                  <span>{job ? `${job.processed}/${job.total}` : '0/0'} ({pct}%)</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${stage === 'done' && job?.status === 'done' ? 100 : pct}%` }} />
                </div>
                {stage === 'running' && <p className="text-xs text-gray-400 mt-1">Bạn có thể đóng cửa sổ này, hệ thống vẫn tiếp tục nhập. Tải lại danh sách để xem kết quả.</p>}
              </div>

              {job && (
                <div className="flex items-start gap-2 text-sm">
                  {job.status === 'done' && job.errors.length === 0 ? <CheckCircle2 size={18} className="text-green-600 mt-0.5" /> : <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />}
                  <div className="text-gray-800">
                    Đã tạo <b className="text-green-700">{job.created}</b> sản phẩm mới
                    {job.modelsAdded + job.modelsUpdated > 0 && <>, thêm <b>{job.modelsAdded}</b> model{job.modelsUpdated > 0 && <>, cập nhật {job.modelsUpdated}</>}</>}.
                    {job.created > 0 && !draft && <> Sản phẩm mới đang ở trạng thái <b>Chờ duyệt</b>.</>}
                    {job.fatal && <div className="text-red-600 mt-1">{job.fatal}</div>}
                  </div>
                </div>
              )}
              {job && job.errors.length > 0 && <><div className="text-xs font-semibold text-red-600">Lỗi ({job.errors.length}):</div><IssueList items={job.errors} tone="red" /></>}
              {job && job.warnings.length > 0 && <><div className="text-xs font-semibold text-yellow-700">Cảnh báo ({job.warnings.length}):</div><IssueList items={job.warnings} tone="yellow" /></>}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
            {stage === 'done' ? 'Đóng' : stage === 'running' ? 'Đóng (chạy nền)' : 'Huỷ'}
          </button>
          {stage === 'done' && (
            <button onClick={reset} className="px-4 py-2 bg-white border border-orange-500 text-orange-500 rounded-md text-sm font-medium hover:bg-orange-50">Nhập file khác</button>
          )}
          {(stage === 'idle' || stage === 'checking') && (
            <button disabled={!file || stage === 'checking'} onClick={check}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {stage === 'checking' && <Loader2 size={16} className="animate-spin" />} Kiểm tra file
            </button>
          )}
          {stage === 'checked' && (
            <button disabled={importable === 0} onClick={startImport}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              Nhập {s?.validNewProducts ?? 0} sản phẩm{(s?.validModelTargets ?? 0) > 0 && ` + model cho ${s?.validModelTargets} sản phẩm`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;