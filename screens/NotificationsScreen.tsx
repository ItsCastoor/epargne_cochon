import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getNotifications } from '@/lib/api';
import { logger } from '@/lib/logger';
import { AppStackParamList } from '@/lib/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const MODULE = 'NotificationsScreen';

type Props = BottomTabScreenProps<AppStackParamList, 'NotificationsTab'>;

const NotificationsScreen: React.FC<Props> = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logger.info(MODULE, 'Chargement des notifications');
      const data = await getNotifications();
      const notifList = Array.isArray(data) ? data : (data as { data: Notification[] }).data || [];
      setNotifications(notifList);
      await logger.info(MODULE, `${notifList.length} notifications chargées`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur lors du chargement des notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 24 }}>Notifications</Text>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666', fontSize: 16 }}>Aucune notification</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>{item.title}</Text>
              <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>{item.message}</Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                {new Date(item.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

