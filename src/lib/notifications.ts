export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const sendNotification = async (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    try {
      await (await navigator.serviceWorker.ready).showNotification(title, options);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
  return false;
};

// Track taken medications
const TAKEN_MEDS_KEY = 'taken_medications';

interface TakenMedication {
  medicationName: string;
  date: string;
  time: string;
}

const getTakenMedications = (): TakenMedication[] => {
  if (typeof window === 'undefined') return [];
  const taken = localStorage.getItem(TAKEN_MEDS_KEY);
  return taken ? JSON.parse(taken) : [];
};

const addTakenMedication = (medicationName: string, time: string) => {
  const taken = getTakenMedications();
  const today = new Date().toISOString().split('T')[0];
  
  // Add to taken list
  taken.push({ medicationName, date: today, time });
  
  // Clean up old entries (keep only last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const filtered = taken.filter(med => 
    new Date(med.date) > oneDayAgo
  );
  
  localStorage.setItem(TAKEN_MEDS_KEY, JSON.stringify(filtered));
};

export const isMedicationTaken = (medicationName: string, time: string): boolean => {
  const taken = getTakenMedications();
  const today = new Date().toISOString().split('T')[0];
  
  return taken.some(med => 
    med.medicationName === medicationName && 
    med.date === today && 
    med.time === time
  );
};

export const sendMedicationNotification = (medicationName: string, dosage: number, time: string) => {
  // Check if medication was already taken
  if (isMedicationTaken(medicationName, time)) {
    return false;
  }

  return sendNotification(
    'Medication Reminder',
    {
      body: `Time to take ${medicationName} - ${dosage} pill(s)\nClick to mark as taken`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `medication-${medicationName}-${time}`,
      data: {
        type: 'medication',
        medicationName,
        time
      },
      requireInteraction: true // Keep notification visible until user interacts
    }
  );
};

export const sendTestNotification = () => {
  return sendNotification(
    'Test Notification',
    {
      body: 'This is a test notification to confirm your notifications are working.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    }
  );
};

// Initialize service worker
if (typeof window !== 'undefined') {
  // Register service worker
  navigator.serviceWorker.register('/notification-worker.js')
    .then(() => {
      console.log('ServiceWorker registration successful');
    })
    .catch(err => {
      console.error('ServiceWorker registration failed:', err);
    });
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'MEDICATION_TAKEN') {
      const { medicationName, time } = event.data;
      addTakenMedication(medicationName, time);
    }
  });
} 