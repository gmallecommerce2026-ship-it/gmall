import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api/ApiClient';
import { useUserStore } from './useUserStore';
// Fix BUG-FE-10 (wiki 0030): centralized API_BASE_URL
import { API_BASE_URL } from '@/lib/api/config';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT';
  createdAt: string;
  isRead?: boolean;
  sender?: { name: string; avatar?: string };
  products?: any[]; 
  options?: string[]; 
  isMultiSelect?: boolean;
}

export interface Conversation {
  id: string;
  partner: { id: string; name: string; avatar?: string; role?: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatState {
  socket: Socket | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isOpen: boolean;
  isMinimized: boolean;
  isAiTyping: boolean;
  
  // Actions
  connectSocket: (token: string | null) => void;
  disconnectSocket: () => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string, type?: 'TEXT' | 'IMAGE' | 'PRODUCT', metadata?: any) => void;
  openChatWithSeller: (sellerId: string, shopName?: string, shopAvatar?: string) => Promise<void>;
  // 👇 1. THÊM HÀM MỚI
  openChatWithFriend: (friendId: string, friendName: string, friendAvatar?: string) => Promise<void>;
  toggleChat: () => void;
  minimizeChat: () => void;
  addMessage: (msg: any) => void;
  clearMessages: () => void;
  setAiTyping: (status: boolean) => void;
  startConsultation: () => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  conversations: [],
  activeConversationId: null,
  messages: {},
  isOpen: false,
  isMinimized: true,
  isAiTyping: false,

  connectSocket: () => {
    const currentSocket = get().socket;
    if (currentSocket && currentSocket.connected) return;

    const socketUrl = API_BASE_URL;
    
    // B3.3 fix: thêm 'polling' làm fallback. Chỉ dùng 'websocket' thuần sẽ
    // chết nếu proxy (Nginx/Render) không route WS correctly, khiến user
    // thấy chat "không gửi được" mà không hiểu vì sao.
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      withCredentials: true,
    });

    newSocket.on('receive_message', (msg: any) => {
        console.log("📩 Socket received:", msg);
        
        set({ isAiTyping: false });

        const { messages, activeConversationId, conversations } = get();
        const currentUser = useUserStore.getState().user;
        const currentUserId = currentUser?.id;
        
        const isAiMessage = msg.senderId === 'AI_ASSISTANT' || (msg.sender && msg.sender.id === 'AI_ASSISTANT');
        
        let targetId = msg.conversationId;
        if (isAiMessage) {
            targetId = 'temp_ai_chat';
        }

        const incomingMsg: Message = {
            id: msg.id || Date.now().toString(),
            senderId: msg.senderId,
            content: msg.content,
            type: msg.type || 'TEXT',
            createdAt: msg.timestamp || new Date().toISOString(),
            sender: msg.sender,
            products: msg.products,
            options: msg.options
        };

        // 3. Logic gộp ID tạm (Update để hỗ trợ cả temp_shop_ và temp_user_)
        if (!isAiMessage && activeConversationId) {
            // Helper để check xem tin nhắn này có thuộc về active conversation tạm thời không
            const checkTempMatch = (prefix: string) => {
                if (activeConversationId.startsWith(prefix)) {
                    const tempId = activeConversationId.replace(prefix, '');
                    // Nếu sender hoặc receiver trùng với ID tạm
                    if (msg.senderId === tempId || msg.receiverId === tempId || (msg.sender && msg.sender.id === tempId)) {
                        // Nếu tin nhắn trả về ID thật (targetId) khác ID tạm (activeConversationId) -> Merge
                        if (targetId && targetId !== activeConversationId) {
                            const tempMsgs = messages[activeConversationId] || [];
                            set((state) => ({
                                activeConversationId: targetId,
                                messages: {
                                    ...state.messages,
                                    [targetId]: [...tempMsgs, incomingMsg], 
                                    [activeConversationId]: [] 
                                }
                            }));
                            get().loadConversations();
                            return true; 
                        }
                    }
                }
                return false;
            };

            // Check temp shop
            if (checkTempMatch('temp_shop_')) return;
            // Check temp user
            if (checkTempMatch('temp_user_')) return;
        }

        if (!targetId) targetId = isAiMessage ? 'temp_ai_chat' : (activeConversationId || 'temp_ai_chat');
        const currentMsgs = messages[targetId] || [];

        const isExactDuplicate = currentMsgs.some(m => m.id === incomingMsg.id);
        if (isExactDuplicate) return;

        // B3.3 fix: merge theo clientTempId (BE echo về), không match theo
        // content. Trước đây nếu user gõ 2 tin "OK" liên tiếp thì chỉ 1 tin
        // được replace đúng, tin còn lại bị duplicate.
        let isOptimisticMerged = false;
        if (currentUserId && incomingMsg.senderId === currentUserId) {
            const tempIdFromServer = (msg as any).clientTempId;
            const optimisticIndex = tempIdFromServer
              ? currentMsgs.findIndex((m: any) => m.clientTempId === tempIdFromServer)
              : currentMsgs.findIndex(m =>
                  m.content === incomingMsg.content &&
                  m.type === incomingMsg.type &&
                  m.id !== incomingMsg.id
                );

            if (optimisticIndex !== -1) {
                const updatedMsgs = [...currentMsgs];
                updatedMsgs[optimisticIndex] = incomingMsg;
                set({
                    messages: { ...messages, [targetId]: updatedMsgs }
                });
                isOptimisticMerged = true;
            }
        }

        if (!isOptimisticMerged) {
            set({
                messages: {
                    ...messages,
                    [targetId]: [...currentMsgs, incomingMsg]
                }
            });
        }

        if (!isAiMessage) {
            const targetConvIndex = conversations.findIndex(c => c.id === targetId);
            if (targetConvIndex !== -1) {
                let updatedConversations = [...conversations];
                const targetConv = { ...updatedConversations[targetConvIndex] };
                targetConv.lastMessage = incomingMsg.type === 'IMAGE' ? '[Hình ảnh]' : incomingMsg.content;
                targetConv.lastMessageAt = incomingMsg.createdAt;

                if (incomingMsg.senderId !== currentUserId && activeConversationId !== targetId) {
                    targetConv.unreadCount = (targetConv.unreadCount || 0) + 1;
                }
                updatedConversations.splice(targetConvIndex, 1);
                updatedConversations.unshift(targetConv);
                set({ conversations: updatedConversations });
            } else {
                 get().loadConversations();
            }
        }
    });

    // B3.3 fix: khi BE report save fail, flag tin optimistic là failed để UI
    // hiển thị "!" + nút Gửi lại (UI dành cho tin này - có field `failed`).
    newSocket.on('message_error', (err: { clientTempId?: string; message?: string }) => {
        console.error('Message send failed:', err);
        if (!err.clientTempId) return;
        const { messages } = get();
        const next: Record<string, Message[]> = {};
        for (const [convId, msgs] of Object.entries(messages)) {
            next[convId] = msgs.map((m: any) =>
                m.clientTempId === err.clientTempId
                    ? { ...m, pending: false, failed: true, error: err.message }
                    : m,
            );
        }
        set({ messages: next });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      // Fix BUG-FE-7 (wiki 0030): removeAllListeners() TRƯỚC disconnect().
      // Trước đây chỉ disconnect() — internal listeners (receive_message,
      // message_error...) vẫn registered trên socket instance. Khi
      // connectSocket() chạy lại (logout/login, HMR dev), .on() đăng ký thêm
      // → mỗi event nhận N lần → tin nhắn duplicate trong UI. Liên quan B3.3
      // (wiki 0014) — fix BE đã làm, fix FE bù phần listener leak.
      socket.removeAllListeners();
      socket.disconnect();
    }
    set({ socket: null });
  },

  openChatWithSeller: async (sellerId, shopName, shopAvatar) => {
    const { conversations, selectConversation, loadConversations } = get();
    set({ isOpen: true, isMinimized: false });

    // wiki 0043: optional-chain phòng partner null khi user kia bị xóa
    const existingConv = conversations.find(c => c.partner?.id === sellerId);
    if (existingConv) {
        await selectConversation(existingConv.id);
        return;
    }

    const tempConvId = `temp_shop_${sellerId}`;
    const existingTemp = conversations.find(c => c.id === tempConvId);
    if (existingTemp) {
        set({ activeConversationId: tempConvId });
        return;
    }

    const tempConversation: Conversation = {
        id: tempConvId,
        partner: { 
            id: sellerId, 
            name: shopName || 'Shop', 
            avatar: shopAvatar,
            role: 'SELLER'
        },
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0
    };

    set(state => ({
        conversations: [tempConversation, ...state.conversations], 
        activeConversationId: tempConvId,
        messages: { ...state.messages, [tempConvId]: [] }
    }));

    try {
        const res = await apiClient.post('/chat/open-chat', { receiverId: sellerId });
        if (res && res.id) {
            const { activeConversationId } = get();
            if (activeConversationId === tempConvId) {
                await loadConversations(); 
                set({ activeConversationId: res.id });
                await get().loadMessages(res.id);
            } else {
                await loadConversations();
            }
        }
    } catch (error) {
        console.error("Failed to create conversation:", error);
    }
  },

  // 👇 2. IMPLEMENT HÀM openChatWithFriend
  openChatWithFriend: async (friendId, friendName, friendAvatar) => {
    const { conversations, selectConversation, loadConversations } = get();
    set({ isOpen: true, isMinimized: false });

    // Check hội thoại thật — wiki 0043: optional-chain phòng partner null
    const existingConv = conversations.find(c => c.partner?.id === friendId);
    if (existingConv) {
        await selectConversation(existingConv.id);
        return;
    }

    // Check hội thoại tạm
    const tempConvId = `temp_user_${friendId}`;
    const existingTemp = conversations.find(c => c.id === tempConvId);
    if (existingTemp) {
        set({ activeConversationId: tempConvId });
        return;
    }

    // Tạo hội thoại tạm
    const tempConversation: Conversation = {
        id: tempConvId,
        partner: { 
            id: friendId, 
            name: friendName, 
            avatar: friendAvatar,
            role: 'USER' // Role User thường
        },
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0
    };

    set(state => ({
        conversations: [tempConversation, ...state.conversations], 
        activeConversationId: tempConvId,
        messages: { ...state.messages, [tempConvId]: [] }
    }));

    try {
        const res = await apiClient.post('/chat/open-chat', { receiverId: friendId });
        if (res && res.id) {
            const { activeConversationId } = get();
            if (activeConversationId === tempConvId) {
                await loadConversations(); 
                set({ activeConversationId: res.id });
                await get().loadMessages(res.id);
            } else {
                await loadConversations();
            }
        }
    } catch (error) {
        console.error("Failed to create conversation with friend:", error);
    }
  },

  loadConversations: async () => {
    try {
      const res = await apiClient.get('/chat/conversations');
      if (res) set({ conversations: res });
    } catch (error) { console.error(error); }
  },

  loadMessages: async (conversationId: string) => {
    try {
      const res = await apiClient.get(`/chat/messages/${conversationId}`);
      if (res && Array.isArray(res)) {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: res.reverse() }
        }));
      }
    } catch (error) { console.error(error); }
  },

  selectConversation: async (conversationId: string) => {
    set({ activeConversationId: conversationId, isAiTyping: false });
    await get().loadMessages(conversationId);

    // [round15 FIX unread-badge] Trước đây mở hội thoại chỉ load message mà
    // không bao giờ mark-as-read → badge đỏ (unreadCount) kẹt vĩnh viễn vì BE
    // cũng không set isRead. Optimistic zero local count + gọi PATCH /chat/read
    // để persist isRead=true. Bỏ qua id tạm (temp_*) vì chưa có conversation thật.
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    }));
    const isTempId =
      conversationId.startsWith('temp_shop_') ||
      conversationId.startsWith('temp_user_') ||
      conversationId === 'temp_ai_chat';
    if (!isTempId) {
      try {
        await apiClient.patch(`/chat/read/${conversationId}`);
      } catch (error) {
        console.error('Failed to mark conversation as read:', error);
      }
    }
  },

  sendMessage: (content, type = 'TEXT', metadata) => {
    const { socket, activeConversationId, conversations } = get();
    if (!socket) return;

    let receiverId = 'AI_ASSISTANT';
    let targetConvId = 'temp_ai_chat';

    if (activeConversationId && activeConversationId !== 'temp_ai_chat') {
        if (activeConversationId.startsWith('temp_shop_')) {
            receiverId = activeConversationId.replace('temp_shop_', '');
        } else if (activeConversationId.startsWith('temp_user_')) {
            receiverId = activeConversationId.replace('temp_user_', '');
        } else {
            const currentConv = conversations.find(c => c.id === activeConversationId);
            // wiki 0043: optional-chain — nếu partner null, không gửi message (return early)
            if (currentConv?.partner?.id) receiverId = currentConv.partner.id;
            else { console.warn('[chat] currentConv missing partner, skip send'); return; }
        }
        targetConvId = activeConversationId;
    }

    if (receiverId === 'AI_ASSISTANT') set({ isAiTyping: true });

    // B3.3 fix: clientTempId để identify tin optimistic. BE echo lại value
    // này trong receive_message -> FE thay thế chính xác, không cần match
    // theo content (dễ sai khi user gõ 2 tin giống nhau).
    const clientTempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
      receiverId: receiverId,
      content,
      type,
      clientTempId,
      ...metadata
    };

    socket.emit('send_message', payload);

    const tempMessage: Message & { clientTempId?: string; pending?: boolean } = {
        id: clientTempId,
        senderId: useUserStore.getState().user?.id || 'ME',
        content: content,
        type: type,
        createdAt: new Date().toISOString(),
        clientTempId,
        pending: true,
    } as any;

    const { messages } = get();
    set({
        messages: {
            ...messages,
            [targetConvId]: [...(messages[targetConvId] || []), tempMessage]
        }
    });
  },

  setAiTyping: (status: boolean) => set({ isAiTyping: status }),
  toggleChat: () => set(state => ({ isOpen: !state.isOpen, isMinimized: false })),
  minimizeChat: () => set({ isOpen: false, isMinimized: true }),
  addMessage: (msg) => {},
  clearMessages: () => set({ messages: {} }),
  
  startConsultation: () => {
    const { socket, connectSocket, conversations } = get();
    
    const aiChatId = 'temp_ai_chat';
    
    // 1. Cập nhật state UI ngay lập tức để người dùng thấy phản hồi
    set((state) => ({ 
        activeConversationId: aiChatId,
        isOpen: true,           // Đảm bảo chat mở
        isMinimized: false,     // Đảm bảo không bị thu nhỏ
        isAiTyping: true,       // Hiển thị loading ngay
        messages: { 
            ...state.messages, 
            [aiChatId]: []      // Reset tin nhắn cũ để bắt đầu mới
        } 
    }));

    // 2. Hàm gửi sự kiện (được gói gọn để tái sử dụng)
    const emitStart = (s: Socket) => {
        console.log("🚀 Emitting start_consultation...");
        s.emit('start_consultation');
    };

    // 3. Xử lý logic Socket
    if (socket && socket.connected) {
        emitStart(socket);
    } else {
        console.log("🔌 Socket disconnected, reconnecting...");
        connectSocket(null);
        
        // Lắng nghe sự kiện connect một lần duy nhất rồi gửi lệnh
        const newSocket = get().socket;
        if (newSocket) {
            newSocket.once('connect', () => {
                emitStart(newSocket);
            });
        }
    }
  },

  closeChat: () => set({ isOpen: false }),
}));