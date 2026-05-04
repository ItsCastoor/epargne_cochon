import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, useWindowDimensions, Pressable } from 'react-native';
import { Text, useTheme, Chip, FAB } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/lib/api';
import { logger } from '@/lib/logger';
import { TabParamList } from '@/lib/navigation';
import { ScreenHeader, CustomButton } from '@/components';

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
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isWebLayout = width > 768;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logger.info(MODULE, 'Chargement des notifications');

      const data = await getNotifications();
      let notifList: Notification[] = [];

      if (Array.isArray(data)) {
        notifList = data;
      } else if ((data as Record<string, unknown>).data && Array.isArray((data as Record<string, unknown>).data)) {
        notifList = (data as Record<string, unknown>).data as Notification[];
      } else if ((data as Record<string, unknown>).notifications && Array.isArray((data as Record<string, unknown>).notifications)) {
        notifList = (data as Record<string, unknown>).notifications as Notification[];
      } else if ((data as Record<string, unknown>)[0]) {
        notifList = Object.values(data as Record<string, unknown>) as Notification[];
      }

      setNotifications(notifList);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur chargement notifications', err);
      Alert.alert('Erreur', 'Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string): Promise<void> => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notif =>
        notif.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer la notification');
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notif => notif.map(n => ({ ...n, read: true })));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer toutes les notifications');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteNotification(id);
      setNotifications(notif => notif.filter(n => n.id !== id));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la notification');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <ScreenHeader
        gradient="notifications"
        title="Notifications"
        subtitle={`${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
        rightContent={
          unreadCount > 0 && (
            <Chip
              icon="bell"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {unreadCount}
              </Text>
            </Chip>
          )
        }
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: isWebLayout ? 32 : 16, paddingVertical: 24 }}
      >
        {/* Action Bar */}
        {unreadCount > 0 && (
          <Pressable
            onPress={handleMarkAllAsRead}
            style={{
              marginBottom: 16,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: theme.colors.primaryContainer,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Marquer tout comme lu
            </Text>
            <MaterialCommunityIcons name="check-all" size={20} color={theme.colors.primary} />
          </Pressable>
        )}

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
              backgroundColor: theme.colors.secondaryContainer,
              borderRadius: 12,
              paddingHorizontal: 24,
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={48} color={theme.colors.secondary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.secondary, marginTop: 16, fontWeight: '700', textAlign: 'center' }}>
              📭 Aucune notification
            </Text>
            <Text style={{ color: theme.colors.onSurface, textAlign: 'center', marginTop: 8 }}>
              Vous gérez bien vos comptes!
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: isWebLayout ? 'row' : 'column', flexWrap: 'wrap', gap: 16, marginBottom: 80 }}>
            {notifications.map((notif) => (
              <View
                key={notif.id}
                style={{
                  width: isWebLayout ? '48%' : '100%',
                  backgroundColor: theme.colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: notif.read ? theme.colors.outlineVariant : theme.colors.error,
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onBackground, marginBottom: 4 }}>
                      {notif.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
                      {notif.message}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={notif.read ? 'check-circle' : 'bell-ring'}
                    size={24}
                    color={notif.read ? theme.colors.outline : theme.colors.error}
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopColor: theme.colors.outline, borderTopWidth: 1 }}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {!notif.read && (
                      <Pressable
                        onPress={() => handleMarkAsRead(notif.id)}
                        style={{ padding: 4 }}
                      >
                        <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => handleDelete(notif.id)}
                      style={{ padding: 4 }}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Refresh FAB */}
      {!isLoading && (
        <FAB
          icon="refresh"
          onPress={loadNotifications}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            backgroundColor: theme.colors.primary,
          }}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

