import { useEffect, useRef } from 'react';
import { sendMedicationNotification, isMedicationTaken } from '@/lib/notifications';
import { recordMedicationStatus } from '@/lib/neo4j';
import { useUser } from '@clerk/nextjs';

interface Medication {
  medication: {
    id: string;
    name: string;
  };
  schedule: {
    schedule: string[];
    pillsPerDose: number[];
    days: string[];
    frequency: number;
  };
}

const NOTIFICATION_CHECK_INTERVAL = 60000; // Check every minute
const NOTIFICATION_THRESHOLD = 5; // Minutes before medication time to notify
const GRACE_PERIOD = 1; // Minutes after scheduled time before marking as missed

export const useMedicationNotifications = (
  medications: Medication[],
  notificationsEnabled: boolean
) => {
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (notificationsEnabled) {
      const recordStatus = async (
        medicationId: string,
        scheduledTime: string,
        actualTime: string | null,
        status: 'taken' | 'missed'
      ) => {
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        await recordMedicationStatus(
          user.id,
          medicationId,
          today,
          scheduledTime,
          actualTime,
          status
        );
      };

      const checkMedications = () => {
        if (!notificationsEnabled || !user) return;

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
        
        medications.forEach(med => {
          const shouldTakeMed = med.schedule.days.includes('Everyday') || 
            med.schedule.days.some(day => {
              if (currentDay === 'Tue' && day === 'T') return true;
              if (currentDay === 'Thu' && day === 'Th') return true;
              if (currentDay === 'Mon' && day === 'M') return true;
              if (currentDay === 'Wed' && day === 'W') return true;
              if (currentDay === 'Fri' && day === 'F') return true;
              if (currentDay === 'Sat' && day === 'Sa') return true;
              if (currentDay === 'Sun' && day === 'Su') return true;
              return false;
            });

          if (shouldTakeMed) {
            med.schedule.schedule.forEach((time) => {
              const [hours, minutes] = time.split(':').map(Number);
              const medicationTime = new Date();
              medicationTime.setHours(hours, minutes, 0, 0);

              const timeDiff = (medicationTime.getTime() - now.getTime()) / 1000 / 60; // Difference in minutes

              // Check if we're in notification window
              if (timeDiff >= 0 && timeDiff <= NOTIFICATION_THRESHOLD) {
                sendMedicationNotification(
                  med.medication.name,
                  med.schedule.pillsPerDose[0],
                  time
                );
              }
              
              // Check if grace period has ended
              if (timeDiff < -GRACE_PERIOD && timeDiff > -(GRACE_PERIOD + 1)) {
                const taken = isMedicationTaken(med.medication.name, time);
                if (taken) {
                  // Get actual time from localStorage
                  const actualTime = new Date().toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  recordStatus(med.medication.id, time, actualTime, 'taken');
                } else {
                  recordStatus(med.medication.id, time, null, 'missed');
                }
              }
            });
          }
        });
      };

      // Initial check
      checkMedications();

      // Set up interval
      checkInterval.current = setInterval(checkMedications, NOTIFICATION_CHECK_INTERVAL);

      return () => {
        if (checkInterval.current) {
          clearInterval(checkInterval.current);
        }
      };
    }
  }, [medications, notificationsEnabled, user]);
}; 