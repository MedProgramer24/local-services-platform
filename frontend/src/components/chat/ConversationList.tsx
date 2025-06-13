import React, { useState, useEffect } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreVertical,
  Trash2,
  Loader2,
  User,
  Building2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

export default function ConversationList() {
  const { 
    conversations, 
    currentConversation, 
    selectConversation, 
    deleteConversation,
    createConversation,
    loading,
    setCurrentConversation,
    setMessages,
    clearConversation
  } = useConversations();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch all providers if user is a customer
  useEffect(() => {
    if (user?.type === 'customer') {
      setLoadingProviders(true);
      axios.get('http://localhost:5000/api/service-providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          console.log('=== PROVIDERS FETCHED ===');
          console.log('Raw providers data:', res.data);
          const providersData = res.data.providers || res.data;
          console.log('Processed providers:', providersData);
          
          // Log each provider's ID structure
          providersData.forEach((provider: any, index: number) => {
            console.log(`Provider ${index + 1}:`, {
              id: provider.id || provider._id,
              name: provider.name,
              businessName: provider.businessName,
              email: provider.email,
              idType: typeof (provider.id || provider._id)
            });
          });
          
          setProviders(providersData);
        })
        .catch((error) => {
          console.error('Error fetching providers:', error);
          setProviders([]);
        })
        .finally(() => setLoadingProviders(false));
    }
  }, [user]);

  // Fetch all customers if user is a provider
  useEffect(() => {
    if (user?.type === 'provider') {
      setLoadingCustomers(true);
      console.log('=== FETCHING CUSTOMERS ===');
      console.log('User type:', user.type);
      console.log('User ID:', user.id);
      
      axios.get('http://localhost:5000/api/auth/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          console.log('=== CUSTOMERS FETCHED ===');
          console.log('Raw customers data:', res.data);
          const customersData = res.data.customers || res.data;
          console.log('Processed customers:', customersData);
          
          // Log each customer's ID structure
          customersData.forEach((customer: any, index: number) => {
            console.log(`Customer ${index + 1}:`, {
              id: customer.id || customer._id,
              name: customer.name,
              email: customer.email,
              idType: typeof (customer.id || customer._id)
            });
          });
          
          setCustomers(customersData);
        })
        .catch((error) => {
          console.error('Error fetching customers:', error);
          setCustomers([]);
        })
        .finally(() => setLoadingCustomers(false));
    }
  }, [user]);

  // Merge providers and conversations
  let mergedList: any[] = [];
  if (user?.type === 'customer') {
    // Map providerId to conversation
    const conversationMap = new Map();
    
    console.log('=== MERGING PROVIDERS AND CONVERSATIONS (CUSTOMER) ===');
    console.log('Current user ID:', user.id);
    console.log('All conversations:', conversations);
    console.log('All providers:', providers);
    
    // Build conversation map with detailed logging
    conversations.forEach((conv, index) => {
      console.log(`\n--- Processing Conversation ${index + 1} ---`);
      console.log('Conversation ID:', conv._id);
      console.log('All participants:', conv.participants);
      
      const other = conv.participants.find((p: any) => {
        console.log('Comparing participant:', p.id || p._id, 'with user:', user.id);
        console.log('Participant type:', typeof (p.id || p._id), 'User type:', typeof user.id);
        return (p.id || p._id) !== user.id;
      });
      
      console.log('Other participant found:', other);
      
      if (other) {
        conversationMap.set(other.id || other._id, conv);
        console.log(`Mapped provider ${other.id || other._id} to conversation ${conv._id}`);
      }
    });
    
    console.log('\nFinal conversation map:', Array.from(conversationMap.entries()));
    
    // Create a list that includes both existing conversations and available providers
    const existingConversationProviders = new Set(conversationMap.keys());
    const allProviders = new Set(providers.map(p => p.id || p._id));
    
    console.log('Existing conversation providers:', Array.from(existingConversationProviders));
    console.log('All providers:', Array.from(allProviders));
    
    // First, add all providers that have conversations
    mergedList = providers
      .filter(provider => conversationMap.has(provider.id || provider._id))
      .map(provider => {
        const conv = conversationMap.get(provider.id || provider._id);
        console.log(`Provider ${provider.id || provider._id} (${provider.name || provider.businessName}) -> Existing conversation:`, conv?._id);
        return {
          provider,
          conversation: conv
        };
      });
    
    // Then, add providers that don't have conversations yet
    const providersWithoutConversations = providers.filter(provider => 
      !conversationMap.has(provider.id || provider._id)
    );
    
    console.log('Providers without conversations:', providersWithoutConversations.length);
    
    providersWithoutConversations.forEach(provider => {
      console.log(`Provider ${provider.id || provider._id} (${provider.name || provider.businessName}) -> No conversation yet`);
      mergedList.push({
        provider,
        conversation: null
      });
    });
    
    console.log('\nFinal merged list for customer:', mergedList);
    console.log('Total items in merged list:', mergedList.length);
    console.log('Items with conversations:', mergedList.filter(item => item.conversation).length);
    console.log('Items without conversations:', mergedList.filter(item => !item.conversation).length);
  } else if (user?.type === 'provider') {
    // Map customerId to conversation
    const conversationMap = new Map();
    
    console.log('=== MERGING CUSTOMERS AND CONVERSATIONS (PROVIDER) ===');
    console.log('Current user ID:', user.id);
    console.log('All conversations:', conversations);
    console.log('All customers:', customers);
    
    // Build conversation map with detailed logging
    conversations.forEach((conv, index) => {
      console.log(`\n--- Processing Conversation ${index + 1} ---`);
      console.log('Conversation ID:', conv._id);
      console.log('All participants:', conv.participants);
      
      const other = conv.participants.find((p: any) => {
        console.log('Comparing participant:', p.id || p._id, 'with user:', user.id);
        console.log('Participant type:', typeof (p.id || p._id), 'User type:', typeof user.id);
        return (p.id || p._id) !== user.id;
      });
      
      console.log('Other participant found:', other);
      
      if (other) {
        conversationMap.set(other.id || other._id, conv);
        console.log(`Mapped customer ${other.id || other._id} to conversation ${conv._id}`);
      }
    });
    
    console.log('\nFinal conversation map:', Array.from(conversationMap.entries()));
    
    mergedList = customers.map(customer => {
      console.log(`\n--- Processing Customer ${customer.id || customer._id} ---`);
      console.log('Customer ID:', customer.id || customer._id, 'Type:', typeof (customer.id || customer._id));
      
      const conv = conversationMap.get(customer.id || customer._id);
      console.log(`Customer ${customer.id || customer._id} (${customer.name}) -> Conversation:`, conv?._id || 'No conversation');
      
      return {
        customer,
        conversation: conv || null
      };
    });
    
    console.log('\nFinal merged list:', mergedList);
  }

  // Filter merged list by search
  const filteredMergedList = mergedList.filter(item => {
    if (user?.type === 'customer') {
      if (!item.provider) return false;
      const businessName = item.provider.businessName;
      const name = item.provider.name;
      const email =
        (item.provider.contactInfo && item.provider.contactInfo.email) ||
        item.provider.email ||
        '';
      const search = (searchTerm || '').toLowerCase();

      return (
        (typeof businessName === 'string' && businessName.toLowerCase().includes(search)) ||
        (typeof name === 'string' && name.toLowerCase().includes(search)) ||
        (typeof email === 'string' && email.toLowerCase().includes(search))
      );
    } else if (user?.type === 'provider') {
      if (!item.customer) return false;
      const name = item.customer.name;
      const email = item.customer.email || '';
      const search = (searchTerm || '').toLowerCase();

      return (
        (typeof name === 'string' && name.toLowerCase().includes(search)) ||
        (typeof email === 'string' && email.toLowerCase().includes(search))
      );
    }
    return false;
  });

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => (p.id || p._id) !== user?.id);
    if (!otherParticipant) return false;
    
    const name = otherParticipant.name || '';
    const email = otherParticipant.email || '';
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get the other participant in a conversation
  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => (p.id || p._id) !== user?.id);
  };

  // Format timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SA', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Get last message preview
  const getLastMessagePreview = (conversation: any) => {
    if (!conversation.lastMessage) return 'لا توجد رسائل';
    
    const content = conversation.lastMessage.content;
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  // Debug function to test conversation isolation
  const debugConversationIsolation = () => {
    console.log('\n=== CONVERSATION ISOLATION DEBUG ===');
    console.log('Total conversations:', conversations.length);
    console.log('Total providers:', providers.length);
    console.log('Total customers:', customers.length);
    console.log('User type:', user?.type);
    console.log('User ID:', user?.id);
    
    // Log all conversations with their participants
    conversations.forEach((conv, index) => {
      console.log(`\nConversation ${index + 1}:`, {
        id: conv._id,
        participants: conv.participants.map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          email: p.email,
          type: p.type,
          idType: typeof (p.id || p._id)
        })),
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount
      });
    });
    
    // Check if any conversation is shared across multiple providers
    const conversationToProviders = new Map();
    
    conversations.forEach(conv => {
      const other = conv.participants.find((p: any) => (p.id || p._id) !== user?.id);
      if (other) {
        const providerId = other.id || other._id;
        if (!conversationToProviders.has(conv._id)) {
          conversationToProviders.set(conv._id, []);
        }
        conversationToProviders.get(conv._id).push(providerId);
      }
    });
    
    console.log('Conversation to providers mapping:', Array.from(conversationToProviders.entries()));
    
    // Check for shared conversations
    const sharedConversations = Array.from(conversationToProviders.entries())
      .filter(([convId, providerIds]) => providerIds.length > 1);
    
    if (sharedConversations.length > 0) {
      console.error('❌ SHARED CONVERSATIONS DETECTED:', sharedConversations);
    } else {
      console.log('✅ All conversations are properly isolated');
    }
  };

  // Run debug on component mount
  useEffect(() => {
    if (conversations.length > 0 && providers.length > 0) {
      debugConversationIsolation();
    }
  }, [conversations, providers]);

  if (loading) {
    return (
      <div className="w-full h-full bg-white rounded-r-2xl shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900 mb-2">المحادثات</h2>
          <p className="text-gray-600 text-sm">إدارة محادثاتك</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 space-x-reverse text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-r-2xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">المحادثات</h2>
            <p className="text-gray-600 text-sm">إدارة محادثاتك</p>
          </div>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-2 h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="البحث في المحادثات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300 rounded-xl"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredMergedList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">لا توجد محادثات</p>
            </div>
          ) : (
            filteredMergedList.map((item, index) => {
              const isActive = currentConversation?._id === item.conversation?._id;
              const otherParticipant = user?.type === 'customer' ? item.provider : item.customer;
              const name = otherParticipant?.name || otherParticipant?.businessName || 'غير معروف';
              const email = otherParticipant?.email || '';
              const lastMessage = item.conversation?.lastMessage;
              const unreadCount = item.conversation?.unreadCount || 0;

              return (
                <div
                  key={otherParticipant?.id || otherParticipant?._id || index}
                  onClick={() => {
                    console.log('=== CLICK HANDLER TRIGGERED ===');
                    console.log('Clicked on conversation item:', {
                      provider: otherParticipant,
                      conversation: item.conversation,
                      isActive: isActive,
                      userType: user?.type
                    });
                    
                    if (item.conversation) {
                      console.log('Selecting existing conversation:', item.conversation._id);
                      selectConversation(item.conversation);
                    } else {
                      // For new conversations, clear the current conversation to show empty chat
                      // Don't automatically create conversation - let user send first message
                      const providerId = otherParticipant?.id || otherParticipant?._id;
                      console.log('No existing conversation - showing empty chat for provider:', providerId);
                      console.log('Calling clearConversation with providerId:', providerId);
                      clearConversation(providerId);
                      console.log('clearConversation called successfully');
                    }
                  }}
                  className={`
                    relative p-4 rounded-xl mb-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {user?.type === 'customer' ? (
                            <Building2 className="h-6 w-6" />
                          ) : (
                            <User className="h-6 w-6" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold p-0 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {lastMessage ? getLastMessagePreview(item.conversation) : 'ابدأ محادثة جديدة'}
                        </p>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0">
                          {user?.type === 'customer' ? 'مزود خدمة' : 'عميل'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.conversation) {
                              deleteConversation(item.conversation._id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف المحادثة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}