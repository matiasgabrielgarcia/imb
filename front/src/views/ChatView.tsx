import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { chatAPI, Conversation, ChatMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ChatView: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const phoneParamHandledRef = useRef<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadMessages = useCallback(async (phoneNumber: string) => {
    try {
      setError(null);
      const data = await chatAPI.getConversation(phoneNumber);
      setMessages(data.messages || []);
      
      // Assign conversation to current user if not already assigned
      if (data.messages && data.messages.length > 0 && !data.messages[0].userId) {
        await chatAPI.assignConversation(phoneNumber);
        loadConversations(); // Reload to update assignment
      }
    } catch (err: any) {
      // If conversation doesn't exist yet, that's okay - set empty messages
      console.log('No existing messages for this phone number:', err);
      setMessages([]);
      // Don't set error - allow user to start a new conversation
    }
  }, []);

  // Handle phone number from URL parameter
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    
    if (!phoneParam) {
      phoneParamHandledRef.current = null;
      return;
    }

    // Skip if we already handled this phone param
    if (phoneParamHandledRef.current === phoneParam) {
      return;
    }

    // Check if conversation exists in loaded conversations
    const existingConv = conversations.find(c => c.phoneNumber === phoneParam);
    
    if (existingConv) {
      if (selectedConversation?.phoneNumber !== phoneParam) {
        setSelectedConversation(existingConv);
        phoneParamHandledRef.current = phoneParam;
      }
      return;
    }

    // If no conversation exists, create it
    const newConv: Conversation = {
      phoneNumber: phoneParam,
      lastMessageAt: new Date().toISOString(),
      messageCount: 0,
      lastMessage: '',
      messages: []
    };
    setSelectedConversation(newConv);
    phoneParamHandledRef.current = phoneParam;
    
    // Assign conversation to current user when opening from opportunity
    chatAPI.assignConversation(phoneParam).then(() => {
      // Reload conversations to include the newly assigned one
      loadConversations();
    }).catch(err => {
      console.log('Conversation assignment (may already be assigned):', err);
    });
    
    // Try to load messages
    loadMessages(phoneParam).catch(err => {
      console.log('No existing messages for this phone number:', err);
    });
  }, [searchParams, loadMessages]); // Only depend on searchParams and loadMessages to avoid loops

  // Load messages when selected conversation changes (only if not from URL param)
  useEffect(() => {
    if (selectedConversation && phoneParamHandledRef.current !== selectedConversation.phoneNumber) {
      loadMessages(selectedConversation.phoneNumber);
    }
  }, [selectedConversation?.phoneNumber, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getConversations();
      setConversations(data.conversations);
      
      // Check if there's a phone param and select that conversation
      const phoneParam = searchParams.get('phone');
      if (phoneParam) {
        const existingConv = data.conversations.find(c => c.phoneNumber === phoneParam);
        if (existingConv && selectedConversation?.phoneNumber !== phoneParam) {
          setSelectedConversation(existingConv);
          phoneParamHandledRef.current = phoneParam;
        }
      } else if (data.conversations.length > 0 && !selectedConversation) {
        // Auto-select first conversation if available and no phone param
        setSelectedConversation(data.conversations[0]);
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError('No se pudieron cargar las conversaciones. Asegúrate de estar autenticado.');
    } finally {
      setLoading(false);
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      setError(null);
      
      await chatAPI.sendMessage(selectedConversation.phoneNumber, newMessage.trim());
      
      // Add message to local state immediately
      const sentMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        messageFrom: selectedConversation.phoneNumber,
        message: newMessage.trim(),
        datetime: new Date().toISOString(),
        sentByUserId: user?.id,
        userId: user?.id
      };
      
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      
      // Reload conversations to update last message
      loadConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('No se pudo enviar el mensaje. Verifica la configuración de WhatsApp API.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', mt: 2 }}>
      {/* Conversations List */}
      <Paper
        sx={{
          width: 350,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Conversaciones</Typography>
        </Box>
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {conversations.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No hay conversaciones"
                secondary="Los mensajes recibidos aparecerán aquí"
              />
            </ListItem>
          ) : (
            conversations.map((conv) => (
              <ListItem
                key={conv.phoneNumber}
                button
                selected={selectedConversation?.phoneNumber === conv.phoneNumber}
                onClick={() => setSelectedConversation(conv)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light'
                    }
                  }
                }}
              >
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PhoneIcon />
                </Avatar>
                <ListItemText
                  primary={conv.phoneNumber}
                  secondary={
                    <Box>
                      <Typography variant="body2" noWrap>
                        {conv.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(conv.lastMessageAt)} • {formatTime(conv.lastMessageAt)}
                      </Typography>
                    </Box>
                  }
                />
                {conv.category && conv.category !== 'UNCATEGORIZED' && (
                  <Chip
                    label={conv.category}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Paper
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PhoneIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedConversation.phoneNumber}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedConversation.messageCount} mensajes
                  </Typography>
                </Box>
              </Box>
              {selectedConversation.category && selectedConversation.category !== 'UNCATEGORIZED' && (
                <Chip label={selectedConversation.category} />
              )}
            </Paper>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: 'grey.50'
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                    textAlign: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No hay mensajes aún
                  </Typography>
                  <Typography variant="body2">
                    Escribe un mensaje para iniciar la conversación
                  </Typography>
                </Box>
              ) : (
                messages.map((msg, index) => {
                const isSent = msg.sentByUserId === user?.id;
                const showDate = index === 0 || 
                  new Date(msg.datetime).toDateString() !== 
                  new Date(messages[index - 1].datetime).toDateString();

                return (
                  <React.Fragment key={msg.id || index}>
                    {showDate && (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Chip
                          label={formatDate(msg.datetime)}
                          size="small"
                          sx={{ bgcolor: 'grey.200' }}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isSent ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          bgcolor: isSent ? 'primary.main' : 'white',
                          color: isSent ? 'white' : 'text.primary',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body1">{msg.message}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: 'right'
                          }}
                        >
                          {formatTime(msg.datetime)}
                        </Typography>
                      </Paper>
                    </Box>
                  </React.Fragment>
                );
              }))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Paper
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                gap: 1
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                variant="outlined"
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                sx={{ alignSelf: 'flex-end' }}
              >
                {sending ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <PhoneIcon sx={{ fontSize: 64, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">
              Selecciona una conversación
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.length === 0
                ? 'No hay conversaciones disponibles'
                : 'Elige una conversación de la lista para comenzar'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatView;

