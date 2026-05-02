import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, useWindowDimensions, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getNotifications } from '@/lib/api';
import { logger } from '@/lib/logger';
import { TabParamList } from '@/lib/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const MODULE = 'NotificationsScreen';

type Props = BottomTabScreenProps<TabParamList, 'NotificationsTab'>;

const NotificationsScreen: React.FC<Props> = () => {
  const { width } = useWindowDimensions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isWebLayout = width > 768;

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
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#dc2626',
        paddingHorizontal: 24, 
        paddingVertical: 24,
        paddingTop: 48,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>🔔 Notifications</Text>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: isWebLayout ? 32 : 16, paddingVertical: 24 }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 300,
            backgroundColor: '#fee2e2',
            borderRadius: 12,
            paddingHorizontal: 24,
          }}>
            <Text style={{ color: '#991b1b', fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
              📭 Aucune notification{'\n\n'}Vous gérez bien vos comptes !
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: isWebLayout ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>
            {notifications.map((item) => (
              <View
                key={item.id}
                style={{ 
                  width: isWebLayout ? '48%' : '100%',
                  backgroundColor: '#fff', 
                  borderLeftWidth: 4,
                  borderLeftColor: item.read ? '#9ca3af' : '#dc2626',
                  borderRadius: 12, 
                  padding: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', lineHeight: 18 }}>
                      {item.message}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, marginLeft: 8 }}>
                    {item.read ? '✅' : '🔴'}
                  </Text>
                </View>
                
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
                  📅 {new Date(item.createdAt).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;

