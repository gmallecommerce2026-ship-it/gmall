'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';
import {
    Bold, Italic, List, ListOrdered,
    Image as ImageIcon, Link as LinkIcon,
    Undo, Redo, Underline as UnderlineIcon,
    Code, Youtube as YoutubeIcon, Palette,
    Heading1, Heading2, Heading3, Type,
} from 'lucide-react';
import { uploadFileToR2 } from '@/services/uploadService';
import classNames from 'classnames';

interface DescriptionEditorProps {
    value: string;
    onChange: (html: string) => void;
}

// Spec [0018] yêu cầu TipTap full toolbar: image, video YouTube, color, font,
// heading, HTML view. Mở rộng từ phiên bản cũ chỉ có bold/italic/list/image.

// Button Component cho Toolbar
const ToolbarBtn = ({ onClick, isActive = false, disabled = false, title, children }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={classNames(
            "p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors",
            isActive ? "bg-orange-50 text-orange-600 font-bold" : "",
            disabled ? "opacity-50 cursor-not-allowed" : ""
        )}
    >
        {children}
    </button>
);

// Bảng màu rút gọn (8 màu phổ biến + custom)
const COLOR_PALETTE = [
    '#000000', '#374151', '#9CA3AF',
    '#EF4444', '#F59E0B', '#10B981',
    '#3B82F6', '#8B5CF6',
];

// Font families an toàn (web-safe + 1 font Việt phổ biến)
const FONT_FAMILIES = [
    { label: 'Mặc định', value: '' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
];

export const DescriptionEditor = ({ value, onChange }: DescriptionEditorProps) => {

    // Spec [0018]: HTML source view — seller copy/paste mã hoặc fix nhanh.
    const [isHtmlView, setIsHtmlView] = useState(false);
    const [htmlDraft, setHtmlDraft] = useState('');
    const [isColorOpen, setIsColorOpen] = useState(false);

    // Cấu hình Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            // TextStyle bắt buộc cho Color hoạt động (Color depend TextStyle).
            TextStyle.configure({}),
            Color,
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 border border-gray-200',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-orange-600 underline hover:text-orange-700',
                    rel: 'noopener noreferrer nofollow',
                    target: '_blank',
                },
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                modestBranding: true,
                HTMLAttributes: {
                    class: 'rounded-lg my-4 w-full aspect-video',
                },
            }),
        ],
        content: value, // Giá trị khởi tạo ban đầu
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[250px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        // SSR-safe: Tiptap 3 yêu cầu khai báo immediatelyRender=false trong Next.js
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && value) {
            // Chỉ update nếu nội dung thực sự thay đổi để tránh loop/giật lag
            if (editor.getHTML() !== value) {
                editor.commands.setContent(value);
            }
        }
    }, [value, editor]);

    // Xử lý Upload Ảnh lên R2
    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                try {
                    const url = await uploadFileToR2(file);
                    if (url && editor) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                } catch (error) {
                    console.error("Lỗi upload ảnh:", error);
                    alert("Không thể tải ảnh lên. Vui lòng thử lại.");
                }
            }
        };

        input.click();
    }, [editor]);

    // Add YouTube — paste link, extension tự parse video ID
    const addYoutube = useCallback(() => {
        const url = window.prompt('Dán link YouTube (VD: https://www.youtube.com/watch?v=...)');
        if (!url || !editor) return;
        editor.commands.setYoutubeVideo({
            src: url,
            width: 640,
            height: 360,
        });
    }, [editor]);

    // Add Link
    const addLink = useCallback(() => {
        if (!editor) return;
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Nhập URL (để trống và OK để xoá link)', previous || '');
        if (url === null) return; // user cancel
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    // Toggle HTML view: lưu draft → user sửa raw HTML → khi tắt view, set lại content
    const toggleHtmlView = useCallback(() => {
        if (!editor) return;
        if (!isHtmlView) {
            // chuyển sang HTML view
            setHtmlDraft(editor.getHTML());
            setIsHtmlView(true);
        } else {
            // chuyển ngược lại — apply HTML mới vào editor
            try {
                editor.commands.setContent(htmlDraft);
                onChange(htmlDraft);
            } catch (e) {
                alert('HTML không hợp lệ, vui lòng kiểm tra lại.');
                return;
            }
            setIsHtmlView(false);
        }
    }, [editor, isHtmlView, htmlDraft, onChange]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            {/* TOOLBAR */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center">
                {/* Heading dropdown */}
                <select
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'h1' :
                        editor.isActive('heading', { level: 2 }) ? 'h2' :
                        editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
                    }
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'p') editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: parseInt(v.replace('h', '')) as 1 | 2 | 3 }).run();
                    }}
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-orange-500"
                    title="Cấp tiêu đề"
                >
                    <option value="p">Đoạn văn</option>
                    <option value="h1">Tiêu đề 1</option>
                    <option value="h2">Tiêu đề 2</option>
                    <option value="h3">Tiêu đề 3</option>
                </select>

                {/* Font family dropdown */}
                <select
                    onChange={(e) => {
                        const v = e.target.value;
                        if (!v) editor.chain().focus().unsetMark('textStyle').run();
                        // TipTap 3 chưa có FontFamily extension default trong starter; ta xài
                        // setMark thủ công với inline style — đủ dùng cho HTML xuất ra trang chi tiết.
                        else editor.chain().focus().setMark('textStyle', { fontFamily: v } as any).run();
                    }}
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-orange-500"
                    title="Font chữ"
                    defaultValue=""
                >
                    {FONT_FAMILIES.map(f => (
                        <option key={f.label} value={f.value}>{f.label}</option>
                    ))}
                </select>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarBtn
                    title="In đậm (Ctrl+B)"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                >
                    <Bold size={18} />
                </ToolbarBtn>

                <ToolbarBtn
                    title="In nghiêng (Ctrl+I)"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                >
                    <Italic size={18} />
                </ToolbarBtn>

                <ToolbarBtn
                    title="Gạch chân (Ctrl+U)"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                >
                    <UnderlineIcon size={18} />
                </ToolbarBtn>

                {/* Color picker */}
                <div className="relative">
                    <ToolbarBtn
                        title="Màu chữ"
                        onClick={() => setIsColorOpen(o => !o)}
                        isActive={editor.isActive('textStyle')}
                    >
                        <Palette size={18} />
                    </ToolbarBtn>
                    {isColorOpen && (
                        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
                            {COLOR_PALETTE.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().setColor(c).run();
                                        setIsColorOpen(false);
                                    }}
                                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().unsetColor().run();
                                    setIsColorOpen(false);
                                }}
                                className="col-span-4 mt-1 text-[11px] text-gray-500 hover:text-orange-600 underline"
                            >
                                Bỏ màu
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarBtn
                    title="Danh sách chấm đầu dòng"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                >
                    <List size={18} />
                </ToolbarBtn>

                <ToolbarBtn
                    title="Danh sách số thứ tự"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                >
                    <ListOrdered size={18} />
                </ToolbarBtn>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarBtn title="Chèn ảnh" onClick={addImage}>
                    <ImageIcon size={18} />
                </ToolbarBtn>

                <ToolbarBtn title="Chèn video YouTube" onClick={addYoutube}>
                    <YoutubeIcon size={18} />
                </ToolbarBtn>

                <ToolbarBtn
                    title="Chèn / sửa link"
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                >
                    <LinkIcon size={18} />
                </ToolbarBtn>

                <ToolbarBtn
                    title={isHtmlView ? 'Quay lại trình soạn' : 'Xem / sửa HTML'}
                    onClick={toggleHtmlView}
                    isActive={isHtmlView}
                >
                    <Code size={18} />
                </ToolbarBtn>

                <div className="flex-1"></div>

                <ToolbarBtn
                    title="Hoàn tác (Ctrl+Z)"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo size={18} />
                </ToolbarBtn>

                <ToolbarBtn
                    title="Làm lại (Ctrl+Y)"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo size={18} />
                </ToolbarBtn>
            </div>

            {/* CONTENT AREA */}
            {isHtmlView ? (
                <textarea
                    value={htmlDraft}
                    onChange={(e) => setHtmlDraft(e.target.value)}
                    className="w-full min-h-[250px] p-4 font-mono text-xs outline-none resize-y"
                    spellCheck={false}
                />
            ) : (
                <EditorContent editor={editor} />
            )}
        </div>
    );
};
