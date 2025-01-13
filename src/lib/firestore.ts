import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  limit,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export type UserRole = 'ambassador' | 'program_manager' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Helper function to generate avatar URL
const generateAvatarUrl = (seed: string) => {
  // Use pixel-art collection with customization for fun, colorful avatars
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear&eyes=variant26,variant25,variant24,variant23,variant22,variant21,variant20,variant19,variant18,variant17,variant16,variant15,variant14,variant13,variant12,variant11,variant10,variant09,variant08,variant07,variant06,variant05,variant04,variant03,variant02,variant01&mouth=variant15,variant14,variant13,variant12,variant11,variant10,variant09,variant08,variant07,variant06,variant05,variant04,variant03,variant02,variant01&face=variant09,variant08,variant07,variant06,variant05,variant04,variant03,variant02,variant01&radius=8`;
};

// Types
export type UserPreferences = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  updatedAt: Date;
};

export interface VolunteerRole {
  id: string;
  title: string;
  description: string;
  assignedTo?: string | null;
  eventId: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Event tags
export const EVENT_TAGS = [
  'Networking',
  'Workshop',
  'Social',
  'Community Service',
  'Outdoor Recreation',
  'Professional Development',
  'Cultural',
  'Fundraising',
  'Education',
  'Other'
] as const;

export type EventTag = typeof EVENT_TAGS[number];

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | Timestamp | null;
  location: string | null;
  status: 'idea' | 'planning' | 'published' | 'complete' | 'archived';
  tags: string[];
  collaborators: string[];
  coordinationNotes: string;
  volunteerRoles: VolunteerRole[];
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
    assignedTo?: string;
  }>;
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  report?: EventReport;
  eventType: 'one_time' | 'ongoing';
  linkedProgramId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'waiting' | 'complete';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | Timestamp;
  assignees: string[];
  groupId: string;
  eventId: string;
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// User Functions
export const createUserProfile = async (
  uid: string,
  email: string,
  role: UserRole = 'ambassador',
  firstName: string = '',
  lastName: string = ''
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  const userData: UserProfile = {
    uid,
    email,
    firstName: firstName || '',
    lastName: lastName || '',
    role,
    displayName: firstName && lastName ? `${firstName} ${lastName}` : email,
    avatarUrl: generateAvatarUrl(uid),
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      darkMode: false,
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, userData);
    return userData;
  }
  
  // If user exists, update with any missing fields
  const existingData = userSnap.data() as UserProfile;
  const updatedData = {
    ...userData,
    ...existingData,
    firstName: firstName || existingData.firstName || '',
    lastName: lastName || existingData.lastName || '',
    displayName: (firstName && lastName) ? `${firstName} ${lastName}` : existingData.displayName || email,
    avatarUrl: generateAvatarUrl(uid), // Always update avatar URL
    updatedAt: new Date(),
  };

  await setDoc(userRef, updatedData);
  return updatedData;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
};

export const getUserProfiles = async (): Promise<UserProfile[]> => {
  const usersQuery = query(collection(db, 'users'));
  const querySnapshot = await getDocs(usersQuery);
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User profile not found');
  }

  const existingData = userSnap.data() as UserProfile;
  
  // Ensure firstName and lastName are strings, even if empty
  const firstName = data.firstName ?? existingData.firstName ?? '';
  const lastName = data.lastName ?? existingData.lastName ?? '';
  
  // Only set displayName if we have either first or last name
  const displayName = (firstName || lastName) 
    ? `${firstName} ${lastName}`.trim() 
    : existingData.email;

  const updateData = {
    ...existingData,
    ...data,
    firstName,
    lastName,
    displayName,
    avatarUrl: generateAvatarUrl(existingData.uid), // Use UID for consistent but unique avatars
    updatedAt: new Date(),
  };

  // Remove any undefined or null values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === null) {
      delete updateData[key];
    }
  });

  await setDoc(userRef, updateData);
};

export const updateUserPreferences = async (
  uid: string,
  preferences: Partial<Omit<UserPreferences, 'updatedAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User profile not found');
  }

  const existingData = userSnap.data() as UserProfile;
  const updatedPreferences = {
    ...existingData.preferences,
    ...preferences,
    updatedAt: new Date(),
  };

  await setDoc(userRef, {
    ...existingData,
    preferences: updatedPreferences,
    updatedAt: new Date(),
  }, { merge: true });
};

// Event Functions
export const DEFAULT_CHECKLIST = [
  { id: '1', text: 'Verify venue setup and access', completed: false },
  { id: '2', text: 'Check audio/visual equipment', completed: false },
  { id: '3', text: 'Set up registration/check-in area', completed: false },
  { id: '4', text: 'Brief volunteers on their roles', completed: false },
  { id: '5', text: 'Prepare name tags and materials', completed: false },
  { id: '6', text: 'Test emergency procedures', completed: false },
  { id: '7', text: 'Set up refreshments area', completed: false },
  { id: '8', text: 'Verify parking arrangements', completed: false },
  { id: '9', text: 'Place directional signage', completed: false },
  { id: '10', text: 'Prepare feedback forms', completed: false }
];

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const eventRef = doc(collection(db, 'events'));
  const now = new Date();
  
  await setDoc(eventRef, {
    ...eventData,
    checklist: DEFAULT_CHECKLIST,
    createdAt: now,
    updatedAt: now,
  });
  
  return eventRef.id;
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  return eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } as Event : null;
};

export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  const eventsQuery = query(
    collection(db, 'events'),
    where('collaborators', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(eventsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const updateEventTags = async (
  eventId: string,
  tags: string[]
): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    tags,
    updatedAt: new Date(),
  });
};

export const getEventsByTag = async (tag: string): Promise<Event[]> => {
  const eventsQuery = query(
    collection(db, 'events'),
    where('tags', 'array-contains', tag)
  );
  const querySnapshot = await getDocs(eventsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const addEventCollaborator = async (
  eventId: string,
  userId: string
): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    collaborators: arrayUnion(userId),
    updatedAt: new Date(),
  });
};

export const removeEventCollaborator = async (
  eventId: string,
  userId: string
): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    collaborators: arrayRemove(userId),
    updatedAt: new Date(),
  });
};

// Task Functions
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const taskRef = doc(collection(db, 'tasks'));
  const now = new Date();
  await setDoc(taskRef, {
    ...taskData,
    createdAt: now,
    updatedAt: now,
  });
  return taskRef.id;
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...taskData,
    updatedAt: new Date(),
  });
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('assignees', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(tasksQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const getTasksByEvent = async (eventId: string): Promise<Task[]> => {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(tasksQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const updateTaskStatus = async (
  taskId: string,
  status: Task['status']
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    status,
    updatedAt: new Date(),
  });
};

export const updateTaskPriority = async (
  taskId: string,
  priority: Task['priority']
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    priority,
    updatedAt: new Date(),
  });
};

export const assignTask = async (
  taskId: string,
  userId: string
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    assignees: arrayUnion(userId),
    updatedAt: new Date(),
  });
};

export const unassignTask = async (
  taskId: string,
  userId: string
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    assignees: arrayRemove(userId),
    updatedAt: new Date(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};

export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);
  return taskSnap.exists() ? { id: taskSnap.id, ...taskSnap.data() } as Task : null;
};

// Collaborative Features

// Editor
export interface EditorContent {
  id: string;
  eventId: string;
  content: string;
  lastEditedBy: string;
  updatedAt: Date;
}

export const getEditorContent = async (eventId: string): Promise<EditorContent | null> => {
  const editorQuery = query(
    collection(db, 'editor_content'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(editorQuery);
  const doc = querySnapshot.docs[0];
  return doc ? ({ id: doc.id, ...doc.data() } as EditorContent) : null;
};

export const updateEditorContent = async (
  eventId: string,
  content: string,
  userId: string
): Promise<void> => {
  const editorQuery = query(
    collection(db, 'editor_content'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(editorQuery);
  const existingDoc = querySnapshot.docs[0];

  if (existingDoc) {
    await updateDoc(existingDoc.ref, {
      content,
      lastEditedBy: userId,
      updatedAt: new Date()
    });
  } else {
    await addDoc(collection(db, 'editor_content'), {
      eventId,
      content,
      lastEditedBy: userId,
      updatedAt: new Date()
    });
  }
};

// Whiteboard
export interface WhiteboardNote {
  id: string;
  eventId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export const getWhiteboardNotes = async (eventId: string): Promise<WhiteboardNote[]> => {
  const notesQuery = query(
    collection(db, 'whiteboard_notes'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(notesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhiteboardNote));
};

export const addWhiteboardNote = async (
  eventId: string,
  content: string,
  userId: string
): Promise<string> => {
  const noteRef = await addDoc(collection(db, 'whiteboard_notes'), {
    eventId,
    content,
    createdBy: userId,
    createdAt: new Date()
  });
  return noteRef.id;
};

export const deleteWhiteboardNote = async (noteId: string): Promise<void> => {
  const noteRef = doc(db, 'whiteboard_notes', noteId);
  await deleteDoc(noteRef);
};

// Admin Functions
// File Sharing
export interface SharedFile {
  id: string;
  eventId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export const getSharedFiles = async (eventId: string): Promise<SharedFile[]> => {
  const filesQuery = query(
    collection(db, 'shared_files'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(filesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedFile));
};

export const addSharedFile = async (
  eventId: string,
  file: {
    name: string;
    size: number;
    type: string;
    url: string;
  },
  userId: string
): Promise<string> => {
  const fileRef = await addDoc(collection(db, 'shared_files'), {
    eventId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: file.url,
    uploadedBy: userId,
    uploadedAt: new Date()
  });
  return fileRef.id;
};

export const deleteSharedFile = async (fileId: string): Promise<void> => {
  const fileRef = doc(db, 'shared_files', fileId);
  await deleteDoc(fileRef);
};

export const setUserRole = async (uid: string, role: UserRole): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role,
    updatedAt: new Date(),
  });
};

// Add these new types after the existing types
export interface BudgetItem {
  id: string;
  eventId: string;
  description: string;
  amount: number;
  category: 'venue' | 'catering' | 'marketing' | 'equipment' | 'other';
  status: 'planned' | 'approved' | 'spent';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundingSource {
  id: string;
  eventId: string;
  name: string;
  type: 'sponsor' | 'grant' | 'ticket_sales' | 'other';
  amount: number;
  status: 'potential' | 'committed' | 'received';
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Budget Functions
export const addBudgetItem = async (
  eventId: string,
  data: Omit<BudgetItem, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const budgetItem = {
    ...data,
    eventId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const budgetRef = await addDoc(collection(db, 'budget_items'), budgetItem);
  await updateEventBudgetSummary(eventId);
  return budgetRef.id;
};

export const updateBudgetItem = async (
  itemId: string,
  eventId: string,
  data: Partial<Omit<BudgetItem, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const budgetRef = doc(db, 'budget_items', itemId);
  await updateDoc(budgetRef, {
    ...data,
    updatedAt: new Date(),
  });
  await updateEventBudgetSummary(eventId);
};

export const deleteBudgetItem = async (
  itemId: string,
  eventId: string
): Promise<void> => {
  const budgetRef = doc(db, 'budget_items', itemId);
  await deleteDoc(budgetRef);
  await updateEventBudgetSummary(eventId);
};

export const getBudgetItems = async (eventId: string): Promise<BudgetItem[]> => {
  const budgetQuery = query(
    collection(db, 'budget_items'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(budgetQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetItem));
};

// Funding Source Functions
export const addFundingSource = async (
  eventId: string,
  data: Omit<FundingSource, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const fundingSource = {
    ...data,
    eventId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const fundingRef = await addDoc(collection(db, 'funding_sources'), fundingSource);
  await updateEventBudgetSummary(eventId);
  return fundingRef.id;
};

export const updateFundingSource = async (
  sourceId: string,
  eventId: string,
  data: Partial<Omit<FundingSource, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const fundingRef = doc(db, 'funding_sources', sourceId);
  await updateDoc(fundingRef, {
    ...data,
    updatedAt: new Date(),
  });
  await updateEventBudgetSummary(eventId);
};

export const deleteFundingSource = async (
  sourceId: string,
  eventId: string
): Promise<void> => {
  const fundingRef = doc(db, 'funding_sources', sourceId);
  await deleteDoc(fundingRef);
  await updateEventBudgetSummary(eventId);
};

export const getFundingSources = async (eventId: string): Promise<FundingSource[]> => {
  const fundingQuery = query(
    collection(db, 'funding_sources'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(fundingQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundingSource));
};

export const updateEventBudgetSummary = async (eventId: string): Promise<void> => {
  const [budgetItems, fundingSources] = await Promise.all([
    getBudgetItems(eventId),
    getFundingSources(eventId),
  ]);

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalFunding = fundingSources.reduce((sum, source) => sum + source.amount, 0);
  const remainingBudget = totalFunding - totalBudget;

  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    budget: {
      totalBudget,
      totalFunding,
      remainingBudget,
      lastUpdated: new Date(),
    },
    updatedAt: new Date(),
  });
};

export const updateEvent = async (
  eventId: string,
  eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  
  // Create a clean update object
  const updateData = { ...eventData };
  
  // Convert any Date objects to Timestamps
  if (updateData.date instanceof Date) {
    updateData.date = Timestamp.fromDate(updateData.date);
  }
  
  // Handle null/undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  await updateDoc(eventRef, {
    ...updateData,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const updateAllUserAvatars = async (): Promise<void> => {
  const usersQuery = query(collection(db, 'users'));
  const querySnapshot = await getDocs(usersQuery);
  
  const updatePromises = querySnapshot.docs.map(async (userDoc) => {
    const userData = userDoc.data() as UserProfile;
    await setDoc(userDoc.ref, {
      ...userData,
      avatarUrl: generateAvatarUrl(userData.uid),
      updatedAt: new Date(),
    });
  });

  await Promise.all(updatePromises);
};

// Add new types for event reporting
export type MetricType = 'number' | 'currency' | 'text' | 'boolean' | 'rating';

export interface EventMetricDefinition {
  id: string;
  label: string;
  type: MetricType;
  required: boolean;
  description?: string;
  options?: string[]; // For predefined options if needed
}

export interface EventMetricValue {
  definitionId: string;
  value: string | number | boolean;
}

export interface EventReport {
  id: string;
  eventId: string;
  metrics: EventMetricValue[];
  feedback: string;
  notes: string;
  submittedBy: string;
  submittedAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Available metrics that users can choose from when creating a report
export const AVAILABLE_METRICS: EventMetricDefinition[] = [
  {
    id: 'attendees',
    label: 'Total Attendees',
    type: 'number',
    required: false,
    description: 'Number of people who attended the event'
  },
  {
    id: 'satisfaction',
    label: 'Overall Satisfaction',
    type: 'rating',
    required: false,
    description: 'Average satisfaction rating from attendees (1-5 stars)'
  },
  {
    id: 'newConnections',
    label: 'New Connections Made',
    type: 'number',
    required: false,
    description: 'Number of new connections or relationships formed'
  },
  {
    id: 'donationsTotal',
    label: 'Total Donations',
    type: 'currency',
    required: false,
    description: 'Total amount of donations received'
  },
  {
    id: 'donorsCount',
    label: 'Number of Donors',
    type: 'number',
    required: false,
    description: 'Total number of donors who contributed'
  },
  {
    id: 'pledgesTotal',
    label: 'Total Pledges',
    type: 'currency',
    required: false,
    description: 'Total amount of future pledges made'
  },
  {
    id: 'volunteers',
    label: 'Total Volunteers',
    type: 'number',
    required: false,
    description: 'Number of volunteers who helped'
  },
  {
    id: 'hoursServed',
    label: 'Total Hours Served',
    type: 'number',
    required: false,
    description: 'Total number of volunteer/service hours'
  },
  {
    id: 'learningObjectives',
    label: 'Learning Objectives Met',
    type: 'rating',
    required: false,
    description: 'How well the learning objectives were achieved (1-5 rating)'
  },
  {
    id: 'engagementLevel',
    label: 'Engagement Level',
    type: 'rating',
    required: false,
    description: 'Level of participant engagement (1-5 rating)'
  },
  {
    id: 'skillsGained',
    label: 'Skills Gained',
    type: 'text',
    required: false,
    description: 'Key skills or competencies developed'
  },
  {
    id: 'knowledgeGain',
    label: 'Knowledge Gain',
    type: 'rating',
    required: false,
    description: 'How much knowledge was gained by participants (1-5 rating)'
  },
  {
    id: 'culturalAwareness',
    label: 'Cultural Awareness Impact',
    type: 'rating',
    required: false,
    description: 'Impact on cultural awareness and understanding (1-5 rating)'
  },
  {
    id: 'participants',
    label: 'Active Participants',
    type: 'number',
    required: false,
    description: 'Number of people who actively participated'
  },
  {
    id: 'customMetric',
    label: 'Custom Impact Metric',
    type: 'text',
    required: false,
    description: 'Any other measurable impact (e.g., "50 trees planted", "200 meals served")'
  }
];

// Event Report Functions
export const createEventReport = async (
  eventId: string,
  data: Omit<EventReport, 'id' | 'submittedAt' | 'updatedAt'>
): Promise<string> => {
  // Convert any string values to appropriate types for metrics
  const processedMetrics = data.metrics.map(metric => {
    const definition = AVAILABLE_METRICS.find(def => def.id === metric.definitionId);
    if (!definition) return metric;

    let value = metric.value;
    if (definition.type === 'number' || definition.type === 'currency') {
      value = typeof value === 'string' ? parseFloat(value) : value;
    }
    return { ...metric, value };
  });

  const now = Timestamp.fromDate(new Date());
  const reportData = {
    ...data,
    metrics: processedMetrics,
    submittedAt: now,
    updatedAt: now,
  };

  // Create the report document
  const reportRef = await addDoc(collection(db, 'eventReports'), reportData);

  // Update the event document with the report reference
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    report: {
      id: reportRef.id,
      ...reportData,
    },
    updatedAt: now,
  });

  return reportRef.id;
};

export const getEventReport = async (reportId: string): Promise<EventReport | null> => {
  const reportRef = doc(db, 'eventReports', reportId);
  const reportSnap = await getDoc(reportRef);
  return reportSnap.exists() ? { id: reportSnap.id, ...reportSnap.data() } as EventReport : null;
};

export const getEventReportByEventId = async (eventId: string): Promise<EventReport | null> => {
  const reportsQuery = query(
    collection(db, 'eventReports'),
    where('eventId', '==', eventId),
    limit(1)
  );
  const querySnapshot = await getDocs(reportsQuery);
  const doc = querySnapshot.docs[0];
  return doc ? { id: doc.id, ...doc.data() } as EventReport : null;
};

export const updateEventReport = async (
  reportId: string,
  data: Partial<Omit<EventReport, 'id' | 'eventId' | 'submittedAt' | 'submittedBy'>>
): Promise<void> => {
  const reportRef = doc(db, 'eventReports', reportId);
  const reportSnap = await getDoc(reportRef);
  if (!reportSnap.exists()) throw new Error('Report not found');

  const reportData = reportSnap.data();
  const eventId = reportData.eventId;

  // Process metrics if they exist in the update
  let processedData = { ...data };
  if (data.metrics) {
    processedData.metrics = data.metrics.map(metric => {
      const definition = AVAILABLE_METRICS.find(def => def.id === metric.definitionId);
      if (!definition) return metric;

      let value = metric.value;
      if (definition.type === 'number' || definition.type === 'currency') {
        value = typeof value === 'string' ? parseFloat(value) : value;
      }
      return { ...metric, value };
    });
  }

  const now = Timestamp.fromDate(new Date());
  processedData.updatedAt = now;

  // Update the report document
  await updateDoc(reportRef, processedData);

  // Update the event document with the updated report
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    report: {
      id: reportId,
      ...reportData,
      ...processedData,
    },
    updatedAt: now,
  });
};

// Role-based access control functions
export const isAdmin = async (userId: string): Promise<boolean> => {
  const userProfile = await getUserProfile(userId);
  return userProfile?.role === 'admin';
};

export const isAmbassador = async (userId: string): Promise<boolean> => {
  const userProfile = await getUserProfile(userId);
  return userProfile?.role === 'ambassador';
};

export const canEditEvent = async (eventId: string, userId: string): Promise<boolean> => {
  const [userProfile, event] = await Promise.all([
    getUserProfile(userId),
    getEventById(eventId)
  ]);

  if (!userProfile || !event) return false;

  // Program managers can edit any event
  if (userProfile.role === 'program_manager') return true;

  // Ambassadors can edit events they created or are collaborators on
  if (userProfile.role === 'ambassador') {
    return event.createdBy === userId || event.collaborators.includes(userId);
  }

  // External collaborators cannot edit events
  return false;
};

// Update user role
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    role,
    updatedAt: new Date()
  });
};

// Event volunteer roles functions
export const addVolunteerRole = async (
  roleData: Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>,
  eventId: string
): Promise<void> => {
  const roleRef = doc(collection(db, 'volunteer_roles'));
  await setDoc(roleRef, {
    ...roleData,
    eventId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateVolunteerRole = async (
  roleId: string,
  roleData: Partial<Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>>,
  eventId: string
): Promise<void> => {
  const roleRef = doc(db, 'volunteer_roles', roleId);
  await updateDoc(roleRef, {
    ...roleData,
    eventId,
    updatedAt: new Date(),
  });
};

export const deleteVolunteerRole = async (
  roleId: string,
  eventId: string
): Promise<void> => {
  const roleRef = doc(db, 'volunteer_roles', roleId);
  await deleteDoc(roleRef);
};

// Initialize admin user
export const initializeAdminUser = async (email: string): Promise<void> => {
  const usersQuery = query(
    collection(db, 'users'),
    where('email', '==', email)
  );
  
  const querySnapshot = await getDocs(usersQuery);
  const userDoc = querySnapshot.docs[0];
  
  if (userDoc) {
    await updateUserRole(userDoc.id, 'program_manager');
  } else {
    console.error('User not found:', email);
  }
};

export interface VolunteerFeedback {
  id: string;
  eventId: string;
  roleId: string;
  roleEffectiveness: 'very_effective' | 'effective' | 'neutral' | 'needs_improvement' | 'ineffective';
  feedback: string;
  suggestions: string;
  wouldVolunteerAgain: 'definitely' | 'maybe' | 'no';
  submittedAt: Date | Timestamp;
}

export const addVolunteerFeedback = async (
  eventId: string,
  roleId: string,
  feedbackData: Omit<VolunteerFeedback, 'id' | 'eventId' | 'roleId'>
): Promise<void> => {
  const feedbackRef = doc(collection(db, 'volunteer_feedback'));
  await setDoc(feedbackRef, {
    ...feedbackData,
    eventId,
    roleId,
    submittedAt: new Date(),
  });
};

export const getVolunteerFeedbackByEvent = async (eventId: string): Promise<VolunteerFeedback[]> => {
  const feedbackQuery = query(
    collection(db, 'volunteer_feedback'),
    where('eventId', '==', eventId)
  );
  const querySnapshot = await getDocs(feedbackQuery);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VolunteerFeedback[];
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  const eventRef = doc(db, 'events', eventId);
  await deleteDoc(eventRef);
};

export interface Notification {
  id: string;
  userId: string;
  type: 'task' | 'checklist' | 'comment' | 'event' | 'role';
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
  eventId: string;
  tabId?: string;
  metadata?: {
    taskId?: string;
    checklistItemId?: string;
    commentId?: string;
  };
}

// Get notifications for a user
export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
    readAt: serverTimestamp()
  });
}

// Create a notification
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
  const notificationsRef = collection(db, 'notifications');
  const docRef = await addDoc(notificationsRef, {
    ...notification,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<void> {
  const notificationRef = doc(db, 'notifications', notificationId);
  await deleteDoc(notificationRef);
}

export const getAllEvents = async (includeUnpublished: boolean = false): Promise<Event[]> => {
  const eventsQuery = includeUnpublished 
    ? query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc')
      )
    : query(
        collection(db, 'events'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
  const querySnapshot = await getDocs(eventsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};
