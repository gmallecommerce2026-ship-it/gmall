"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { 
  X, Send, RefreshCw, Search, Bot, Check, ArrowRight, 
  Sparkles, ChevronLeft, MapPin, ShoppingBag, RefreshCcw, 
  Smile
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

const ProductRecommendation = ({ product }: { product: any }) => (
  <div className="flex gap-3 p-3 mt-2 bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer group animate-in fade-in slide-in-from-bottom-2">
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-200">
       {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
       ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
       )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition">{product.name || product.title}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-red-500 font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
        </p>
        <button className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-medium hover:bg-orange-500 hover:text-white transition">
            Xem ngay
        </button>
      </div>
    </div>
  </div>
);

export default function ChatWindow() {
  const { 
    toggleChat, messages, activeConversationId, conversations, selectConversation,
    sendMessage, loadConversations, isAiTyping, startConsultation, socket, connectSocket,
    disconnectSocket, // [1] Add disconnectSocket
    isOpen
  } = useChatStore();
  
  const { user } = useUserStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(false); 
  const [showEmoji, setShowEmoji] = useState(false);
  
  const onEmojiClick = (emojiObject: any) => {
    setInputValue((prev) => prev + emojiObject.emoji);
  };
  
  // Wiki 0067: socket lifecycle giờ do ChatSocketProvider quản lý (component
  // headless luôn mounted). ChatWindow chỉ lo UI hiển thị. Nếu return null
  // ở line 126 thì các useEffect ở đây không chạy → tin nhắn không đến cho
  // tới khi user click mở chat — đó là root cause bug brief.

  const currentConv = conversations.find(c => c.id === activeConversationId);
  const displayConversationId = activeConversationId || 'temp_ai_chat';
  // hooks-fix wiki 0031: useMemo cho currentMessages để dep effect scroll ổn định
  const currentMessages = useMemo(
    () => messages[displayConversationId] || [],
    [messages, displayConversationId]
  );
  const isAiConversation =
    !activeConversationId ||
    activeConversationId === 'temp_ai_chat' ||
    currentConv?.partner?.id === 'AI_ASSISTANT';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isAiTyping, isOpen]); // Added isOpen to scroll when opening

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
    setShowEmoji(false);
  };

  const handleOptionClick = (text: string, isMultiSelect?: boolean) => {
    if (isMultiSelect) {
        setSelectedChips(prev => prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]);
    } else {
        sendMessage(text);
    }
  };

  const handleConfirmSelection = () => {
      if (selectedChips.length > 0) {
          sendMessage(`Tôi chọn: ${selectedChips.join(', ')}`);
          setSelectedChips([]);
      }
  };

  const handleFindMore = () => {
      sendMessage("Tìm quà khác");
  };

  const shouldShowInput = !isAiConversation || currentMessages.length > 0;
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 z-[9999] flex flex-col md:flex-row bg-white md:w-[900px] md:h-[650px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 overflow-hidden font-sans animate-in slide-in-from-bottom-5 duration-300">
      
      {/* --- SIDEBAR --- */}
      <div className={`
        absolute inset-0 z-20 bg-white md:static md:w-[320px] md:border-r md:border-gray-100 flex flex-col transition-transform duration-300
        ${showSidebarOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-gray-50/50">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-lg">Tin nhắn</h3>
                <button onClick={() => setShowSidebarOnMobile(false)} className="md:hidden p-2 text-gray-500">
                    <X size={20} />
                </button>
            </div>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" placeholder="Tìm người dùng..." 
                    className="w-full bg-white border border-gray-200 text-sm pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            <div 
                onClick={() => { selectConversation('temp_ai_chat'); setShowSidebarOnMobile(false); }}
                className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all
                    ${isAiConversation ? 'bg-orange-50 border border-orange-100 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}
                `}
            >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white shadow-md">
                    <Sparkles size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">Chuyên gia tư vấn quà tặng</h4>
                    <p className="text-xs text-orange-600 font-medium">Tìm quà siêu tốc 🚀</p>
                </div>
            </div>
            
            <div className="h-px bg-gray-100 my-2 mx-4" />

            {conversations.filter(c => c.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(conv => (
                <div 
                    key={conv.id}
                    onClick={() => { selectConversation(conv.id); setShowSidebarOnMobile(false); }}
                    className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all
                        ${activeConversationId === conv.id ? 'bg-white border border-gray-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}
                    `}
                >
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {conv.partner?.avatar ? (
                            <img
                              src={conv.partner.avatar}
                              alt={conv.partner?.name || ''}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Wiki 0044: avatar URL có thể 404 (user xóa ảnh hoặc URL stale).
                                // Hide <img> + show initial fallback (parent div sẽ render initial).
                                const el = e.target as HTMLImageElement;
                                el.style.display = 'none';
                              }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                {(conv.partner?.name || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {conv.partner?.name}
                            </h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                {new Date(conv.lastMessageAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {conv.lastMessage}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col bg-white h-[100dvh] md:h-auto w-full relative">
        
        {/* Header */}
        <div className="h-[64px] px-4 md:px-6 border-b border-gray-100 flex justify-between items-center shadow-sm bg-white z-10">
            <div className="flex items-center gap-3">
                <button onClick={() => setShowSidebarOnMobile(true)} className="md:hidden p-1.5 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                </button>

                {isAiConversation ? (
                    <div className="flex items-center gap-3 animate-in fade-in">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white shadow-md">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm md:text-base">Chuyên gia tư vấn quà tặng</h3>
                            <p className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {currentConv?.partner?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{currentConv?.partner?.name}</h3>
                            <p className="text-xs text-gray-500">Đang hoạt động</p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-1">
                {isAiConversation && (
                    <button 
                        onClick={startConsultation}
                        className="cursor-pointer pointer-events-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold hover:bg-orange-100 transition mr-2 border border-orange-200"
                    >
                        <Sparkles size={14} />
                        Tư vấn lại
                    </button>
                )}
                
                 {isAiConversation && (
                    <button onClick={startConsultation} className="md:hidden p-2 text-orange-500 hover:bg-orange-50 rounded-full">
                         <Sparkles size={20} />
                    </button>
                 )}

                <button onClick={toggleChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                    <X size={22} />
                </button>
            </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 bg-gray-50/30 custom-scrollbar scroll-smooth">
            {isAiConversation && currentMessages.length === 0 && !isAiTyping && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-4 animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center shadow-inner">
                        <img src="https://cdn-icons-png.flaticon.com/512/4213/4213642.png" alt="Gift" className="w-14 h-14 object-contain animate-bounce-slow" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Cần tìm quà tặng?</h2>
                        <p className="text-sm text-gray-500">
                            Chào quý khách! Em là chuyên gia tư vấn quà tặng của G-MALL. Hãy cho em biết a/c muốn tặng quà cho ai, em sẽ gợi ý món quà hoàn hảo nhất!
                        </p>
                    </div>
                    <button 
                        onClick={() => startConsultation()} // Hàm này giờ đã xịn hơn nhờ sửa Store
                        className="cursor-pointer pointer-events-auto group px-6 py-3 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:bg-orange-600 hover:shadow-orange-200 transition-all flex items-center gap-2 transform hover:-translate-y-1 active:scale-95"
                    >
                        <Sparkles size={18} className="text-yellow-300" />
                        Bắt đầu tư vấn ngay
                    </button>
                </div>
            )}

            {currentMessages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id || msg.senderId === 'ME';
                return (
                    <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[90%] md:max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mt-1 shadow-sm">
                                    <Bot size={18} className="text-orange-500"/> 
                                </div>
                            )}

                            <div className="flex flex-col min-w-0">
                                <div className={`
                                    px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words relative
                                    ${isMe 
                                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-tr-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}
                                `}>
                                    {msg.content}
                                </div>

                                {!isMe && msg.options && msg.options.length > 0 && (
                                    <div className="mt-3 animate-in fade-in slide-in-from-left-2 duration-500">
                                        <div className="flex flex-wrap gap-2">
                                            {msg.options.map((opt, optIdx) => {
                                                const isSelected = selectedChips.includes(opt);
                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleOptionClick(opt, msg.isMultiSelect)}
                                                        disabled={!msg.isMultiSelect && idx !== currentMessages.length - 1}
                                                        className={`
                                                            px-3 py-2 text-xs md:text-sm font-medium rounded-xl border transition-all shadow-sm
                                                            ${isSelected 
                                                                ? 'bg-orange-600 border-orange-600 text-white' 
                                                                : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:shadow-md'}
                                                            ${(!msg.isMultiSelect && idx !== currentMessages.length - 1) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                                                        `}
                                                    >
                                                        {msg.isMultiSelect && isSelected && <Check size={14} className="inline mr-1" />}
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {msg.isMultiSelect && selectedChips.length > 0 && idx === currentMessages.length - 1 && (
                                            <div className="mt-2">
                                                 <button 
                                                    onClick={handleConfirmSelection}
                                                    className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg shadow hover:bg-black transition flex items-center gap-2"
                                                >
                                                    Gửi lựa chọn <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {msg.products && msg.products.length > 0 && (
                                    <div className="mt-3 w-full max-w-[280px] animate-in fade-in slide-in-from-bottom-3 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShoppingBag size={14} className="text-orange-600" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gợi ý dành cho bạn</span>
                                        </div>
                                        <div className="space-y-2">
                                            {msg.products.map((p, pIdx) => (
                                                <ProductRecommendation key={p.id || pIdx} product={p} />
                                            ))}
                                        </div>
                                        <button 
                                            onClick={handleFindMore}
                                            className="mt-3 w-full py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:text-orange-600 hover:border-orange-200 transition flex items-center justify-center gap-2 shadow-sm group"
                                        >
                                            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                            Tìm quà khác
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {isAiTyping && isAiConversation && (
                <div className="flex w-full justify-start animate-in fade-in duration-300">
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                            <Bot size={18} className="text-orange-500" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 text-gray-400 text-sm flex items-center gap-2 shadow-sm rounded-tl-none">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            </span>
                            <span className="text-xs font-medium">Đang soạn tin nhắn...</span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
        </div>

        {shouldShowInput && (
        <div className="p-3 md:p-4 bg-white border-t border-gray-100 z-20 pb-safe">
            {showEmoji && (
            <div className="absolute bottom-full left-0 mb-2 ml-4 z-50 shadow-xl border border-gray-200 rounded-2xl animate-in zoom-in-95 duration-200">
               <EmojiPicker 
                  onEmojiClick={onEmojiClick}
                  autoFocusSearch={false}
                  emojiStyle={EmojiStyle.APPLE} 
                  width={300}
                  height={400}
               />
            </div>
          )}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[20px] border border-gray-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-md transition-all duration-300">
                <button 
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`p-2 rounded-full hover:bg-gray-200 transition text-gray-500 ${showEmoji ? 'text-orange-500 bg-orange-50' : ''}`}
                >
                  <Smile size={20} />
                </button>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent px-3 text-[15px] focus:outline-none text-gray-800 placeholder-gray-400 min-w-0"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`p-2.5 rounded-full transition-all flex-shrink-0 flex items-center justify-center
                        ${inputValue.trim() 
                        ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    <Send size={18} className={inputValue.trim() ? 'ml-0.5' : ''} />
                </button>
            </div>
            {showEmoji && (
              <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)}></div>
           )}
            <p className="text-[10px] text-center text-gray-400 mt-2">
                Lời khuyên gợi thêm ý tưởng giúp cho quyết định của bạn tốt hơn.
            </p>
        </div>
      )}
      </div>
      
    </div>
  );
}