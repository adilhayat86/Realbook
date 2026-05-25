export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'listing' | 'follow' | 'message' | 'system';
}

export interface Conversation {
  id: string;
  agentId: string;
  name: string;
  agency: string;
  lastMessage: string;
  time: string;
  unread: number;
  photo?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

export interface FriendRequest {
  id: string;
  agentId: string;
  name: string;
  agency: string;
  city: string;
  mutualFriends: number;
  photo?: string;
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'New listing in DHA Phase 6',
    body: 'Sara Malik posted a 10 Marla corner plot.',
    time: '2m ago',
    read: false,
    type: 'listing',
  },
  {
    id: 'n2',
    title: 'Usman Ali followed you',
    body: 'You have a new follower on DealerTribe.',
    time: '1h ago',
    read: false,
    type: 'follow',
  },
  {
    id: 'n3',
    title: 'Price drop alert',
    body: 'Bahria Town house you saved is now Rs 4.0 Cr.',
    time: '3h ago',
    read: false,
    type: 'listing',
  },
  {
    id: 'n4',
    title: 'Message from Fatima Raza',
    body: 'Is the Gulberg Greens flat still available?',
    time: 'Yesterday',
    read: true,
    type: 'message',
  },
  {
    id: 'n5',
    title: 'Welcome to DealerTribe',
    body: 'Complete your profile to connect with more agents.',
    time: '2 days ago',
    read: true,
    type: 'system',
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    agentId: 'agent1',
    name: 'Sara Malik',
    agency: 'Malik Estate',
    lastMessage: 'Can you share the plot dimensions?',
    time: '2m ago',
    unread: 2,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  },
  {
    id: 'c2',
    agentId: 'agent2',
    name: 'Usman Ali',
    agency: 'Ali Realtors',
    lastMessage: 'Client is interested in Bahria listing.',
    time: '45m ago',
    unread: 1,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
  {
    id: 'c3',
    agentId: 'agent3',
    name: 'Fatima Raza',
    agency: 'Raza Properties',
    lastMessage: 'Thanks, I will visit tomorrow.',
    time: '3h ago',
    unread: 0,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  },
  {
    id: 'c4',
    agentId: 'agent4',
    name: 'Hassan Sheikh',
    agency: 'Sheikh Associates',
    lastMessage: 'Joint deal possible on Park View plot?',
    time: 'Yesterday',
    unread: 0,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  },
  {
    id: 'c5',
    agentId: 'agent5',
    name: 'Ayesha Noor',
    agency: 'Noor Realty',
    lastMessage: 'Sent you the commercial brochure.',
    time: 'Monday',
    unread: 0,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  },
];

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', text: 'Assalam o Alaikum, saw your DHA listing.', sent: false, time: '10:20' },
    { id: 'm2', text: 'Walaikum Assalam! Yes it is available.', sent: true, time: '10:22' },
    { id: 'm3', text: 'Can you share the plot dimensions?', sent: false, time: '10:24' },
  ],
  c2: [
    { id: 'm1', text: 'Client is interested in Bahria listing.', sent: false, time: '09:15' },
    { id: 'm2', text: 'Great, I can arrange a visit this week.', sent: true, time: '09:30' },
  ],
  c3: [
    { id: 'm1', text: 'Is the flat still available?', sent: false, time: 'Yesterday' },
    { id: 'm2', text: 'Yes, possession in 3 months.', sent: true, time: 'Yesterday' },
    { id: 'm3', text: 'Thanks, I will visit tomorrow.', sent: false, time: 'Yesterday' },
  ],
};

export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'fr1',
    agentId: 'agent6',
    name: 'Imran Siddiqui',
    agency: 'Siddiqui Properties',
    city: 'Lahore',
    mutualFriends: 4,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
  },
  {
    id: 'fr2',
    agentId: 'agent7',
    name: 'Nadia Hussain',
    agency: 'Hussain Realty',
    city: 'Islamabad',
    mutualFriends: 2,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
  },
];
