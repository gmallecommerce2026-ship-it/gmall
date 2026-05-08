'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Banknote, UserCheck, Clock } from 'lucide-react';

/**
 * Spec [0018]: hover popup bạn bè.
 *
 * Hiển thị thông tin công khai khi rê chuột vào avatar/name của bạn:
 * - Avatar lớn, tên, badge online
 * - Email (đã công khai trên UI hiện tại)
 * - Ngày kết bạn
 * - Quick action: nhắn tin / chuyển xu
 *
 * KHÔNG hiển thị số điện thoại theo yêu cầu khách hàng — kể cả khi BE
 * lỡ trả về phone. Component này là defence-in-depth: nếu sau này có
 * field `phone` trong Friend object, nó vẫn không leak qua popup.
 *
 * Implementation note: dùng portal-less floating div + hover delay 150ms
 * để tránh popup nhấp nháy khi user lướt qua. Dùng absolute positioning
 * thay vì @floating-ui để đỡ thêm dep — giới hạn là popup có thể tràn
 * mép màn hình ở edge case (rare cho danh sách bạn bè).
 */
interface FriendHoverCardProps {
    friend: {
        id: string;
        name: string;
        avatar: string | null;
        email?: string;
        joinedAt?: string;
        isOnline?: boolean;
        role?: string;
    };
    onChat?: (friend: any) => void;
    onTransfer?: (friend: any) => void;
    children: React.ReactNode; // anchor (avatar/name area)
}

const FriendHoverCard: React.FC<FriendHoverCardProps> = ({ friend, onChat, onTransfer, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<'right' | 'left'>('right');
    const anchorRef = useRef<HTMLDivElement>(null);
    const showTimer = useRef<NodeJS.Timeout | null>(null);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const handleEnter = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        showTimer.current = setTimeout(() => {
            // Check vị trí so với viewport, flip sang trái nếu sát mép phải
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                if (rect.right + 320 > window.innerWidth) setPosition('left');
                else setPosition('right');
            }
            setIsOpen(true);
        }, 150);
    };

    const handleLeave = () => {
        if (showTimer.current) clearTimeout(showTimer.current);
        hideTimer.current = setTimeout(() => setIsOpen(false), 200);
    };

    useEffect(() => {
        return () => {
            if (showTimer.current) clearTimeout(showTimer.current);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    return (
        <div
            ref={anchorRef}
            className="relative inline-block"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {children}

            {isOpen && (
                <div
                    className={`absolute z-50 top-full mt-2 ${position === 'right' ? 'left-0' : 'right-0'} w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
                    onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
                    onMouseLeave={handleLeave}
                >
                    {/* Header với gradient */}
                    <div className="h-16 bg-gradient-to-r from-orange-400 to-pink-400" />
                    <div className="px-4 pb-4 -mt-8">
                        <img
                            src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`}
                            alt={friend.name}
                            className="w-16 h-16 rounded-full border-4 border-white shadow object-cover bg-white"
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-800 truncate">{friend.name}</h3>
                            {friend.role === 'SELLER' && (
                                <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded border border-orange-200">
                                    Người bán
                                </span>
                            )}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs">
                            {friend.isOnline ? (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Đang online
                                </span>
                            ) : (
                                <span className="text-gray-400">Đang offline</span>
                            )}
                        </div>

                        {friend.email && (
                            <div className="mt-2 text-xs text-gray-500 truncate">{friend.email}</div>
                        )}

                        {friend.joinedAt && (
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                                <Clock size={11} />
                                Kết bạn từ {new Date(friend.joinedAt).toLocaleDateString('vi-VN')}
                            </div>
                        )}

                        {/* Quick actions */}
                        {(onChat || onTransfer) && (
                            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                                {onChat && (
                                    <button
                                        onClick={() => onChat(friend)}
                                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <MessageCircle size={14} /> Nhắn tin
                                    </button>
                                )}
                                {onTransfer && (
                                    <button
                                        onClick={() => onTransfer(friend)}
                                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    >
                                        <Banknote size={14} /> Chuyển xu
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Spec [0018]: KHÔNG bao giờ render phone — note dev-time */}
                        {/* Nếu cần SĐT, dùng API riêng có quyền + UI confirm. */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendHoverCard;
