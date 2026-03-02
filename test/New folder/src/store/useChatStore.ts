import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api/ApiClient';
import { useUserStore } from './useUserStore';

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

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      withCredentials: true, 
    });

    newSocket.on('receive_message', (msg: any) => {
        console.log("📩 Socket received:", msg);
        
        // [FIX AI] Luôn tắt typing khi nhận bất kỳ tin nhắn nào
        set({ isAiTyping: false });

        const { messages, activeConversationId, conversations } = get();
        const currentUser = useUserStore.getState().user;
        const currentUserId = currentUser?.id;
        
        // 1. Kiểm tra xem có phải tin nhắn từ AI không
        const isAiMessage = msg.senderId === 'AI_ASSISTANT' || (msg.sender && msg.sender.id === 'AI_ASSISTANT');
        
        // [FIX AI] Nếu là AI, BẮT BUỘC target vào hội thoại AI
        let targetId = msg.conversationId;
        if (isAiMessage) {
            targetId = 'temp_ai_chat';
        }

        // 2. Parse tin nhắn
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

        // 3. Logic gộp ID tạm (Chỉ chạy nếu KHÔNG PHẢI là AI)
        if (!isAiMessage && activeConversationId && activeConversationId.startsWith('temp_shop_')) {
            const tempShopId = activeConversationId.replace('temp_shop_', '');
            if (msg.senderId === tempShopId || msg.receiverId === tempShopId || (msg.sender && msg.sender.id === tempShopId)) {
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
                    return; 
                }
            }
        }

        // 4. Fallback targetId
        if (!targetId) targetId = isAiMessage ? 'temp_ai_chat' : (activeConversationId || 'temp_ai_chat');
        const currentMsgs = messages[targetId] || [];

        // 5. Chống đúp tin nhắn (Duplicate check)
        const isExactDuplicate = currentMsgs.some(m => m.id === incomingMsg.id);
        if (isExactDuplicate) return;

        // 6. Merge Optimistic Message (Tin nhắn tạm do mình gửi)
        let isOptimisticMerged = false;
        if (currentUserId && incomingMsg.senderId === currentUserId) {
            const optimisticIndex = currentMsgs.findIndex(m => 
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

        // 7. Thêm tin nhắn mới (nếu chưa merge)
        if (!isOptimisticMerged) {
            set({
                messages: {
                    ...messages,
                    [targetId]: [...currentMsgs, incomingMsg]
                }
            });
        }

        // 8. Update Sidebar (Không áp dụng cho AI chat vì AI luôn ở đầu)
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
    
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null });
  },

  openChatWithSeller: async (sellerId, shopName, shopAvatar) => {
    const { conversations, selectConversation, loadConversations } = get();
    set({ isOpen: true, isMinimized: false });

    const existingConv = conversations.find(c => c.partner.id === sellerId);
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
    // [FIX] Reset typing AI khi chuyển hội thoại
    set({ activeConversationId: conversationId, isAiTyping: false });
    await get().loadMessages(conversationId);
  },

  sendMessage: (content, type = 'TEXT', metadata) => {
    const { socket, activeConversationId, conversations } = get();
    if (!socket) return;

    let receiverId = 'AI_ASSISTANT';
    let targetConvId = 'temp_ai_chat'; // Mặc định là AI

    if (activeConversationId && activeConversationId !== 'temp_ai_chat') {
        if (activeConversationId.startsWith('temp_shop_')) {
            receiverId = activeConversationId.replace('temp_shop_', '');
        } else {
            const currentConv = conversations.find(c => c.id === activeConversationId);
            if (currentConv) receiverId = currentConv.partner.id;
        }
        targetConvId = activeConversationId;
    }

    if (receiverId === 'AI_ASSISTANT') set({ isAiTyping: true });

    const payload = {
      receiverId: receiverId,
      content,
      type,
      ...metadata
    };

    socket.emit('send_message', payload);

    const tempMessage: Message = {
        id: Date.now().toString(),
        senderId: useUserStore.getState().user?.id || 'ME',
        content: content,
        type: type,
        createdAt: new Date().toISOString(),
    };
    
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
      const { socket, connectSocket } = get();
      
      // [FIX AI] Luôn chuyển Active Tab về AI Chat ngay lập tức
      const aiChatId = 'temp_ai_chat';
      set({ activeConversationId: aiChatId });

      // [FIX AI] Reset tin nhắn cũ của AI và bật Typing
      set(state => ({
          messages: { ...state.messages, [aiChatId]: [] },
          isAiTyping: true 
      }));

      // [FIX AI] Xử lý trường hợp Socket chưa sẵn sàng
      if (!socket || !socket.connected) {
          console.log("Socket not ready, trying to reconnect...");
          connectSocket(null);
          
          // Thử emit lại sau 1s (chờ kết nối)
          setTimeout(() => {
              const s = get().socket;
              if (s && s.connected) {
                  s.emit('start_consultation');
              } else {
                  // Nếu vẫn fail thì tắt typing để user không đợi mãi
                  set({ isAiTyping: false });
                  // Có thể thêm toast error ở đây
              }
          }, 1500);
          return;
      }
      
      socket.emit('start_consultation');
  },

  closeChat: () => set({ isOpen: false }),
}));