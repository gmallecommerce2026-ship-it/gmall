'use client';

import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
    Bold, Italic, List, ListOrdered, 
    Image as ImageIcon, Link as LinkIcon, 
    Undo, Redo 
} from 'lucide-react';
import { uploadFileToR2 } from '@/services/uploadService';
import classNames from 'classnames';

interface DescriptionEditorProps {
    value: string;
    onChange: (html: string) => void;
}

// Button Component cho Toolbar
const ToolbarBtn = ({ onClick, isActive = false, disabled = false, children }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={classNames(
            "p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors",
            isActive ? "bg-orange-50 text-orange-600 font-bold" : "",
            disabled ? "opacity-50 cursor-not-allowed" : ""
        )}
    >
        {children}
    </button>
);

export const DescriptionEditor = ({ value, onChange }: DescriptionEditorProps) => {
    
    // Cấu hình Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 border border-gray-200',
                },
            }),
            Link.configure({
                openOnClick: false,
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
                    // Dùng service upload của bạn
                    const url = await uploadFileToR2(file);
                    
                    // Chèn ảnh vào Editor
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

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            {/* TOOLBAR */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center">
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                >
                    <Bold size={18} />
                </ToolbarBtn>
                
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                >
                    <Italic size={18} />
                </ToolbarBtn>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                >
                    <List size={18} />
                </ToolbarBtn>

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                >
                    <ListOrdered size={18} />
                </ToolbarBtn>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarBtn onClick={addImage}>
                    <ImageIcon size={18} />
                </ToolbarBtn>

                <div className="flex-1"></div>

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo size={18} />
                </ToolbarBtn>

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo size={18} />
                </ToolbarBtn>
            </div>

            {/* CONTENT AREA */}
            <EditorContent editor={editor} />
        </div>
    );
};