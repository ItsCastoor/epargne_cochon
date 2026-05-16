import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Text, useTheme, Chip, FAB } from "react-native-paper";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  markNotificationAsUnread,
  NotificationType,
} from "@/lib/api";
import { logger } from "@/lib/logger";
import { TabParamList } from "@/lib/navigation";
import { ScreenHeader } from "@/components";
import { appTheme } from "@/lib/theme";
import { useNotifications } from "@/lib/NotificationsContext";

type AppTheme = typeof appTheme;

interface Notification {
  id: string;
  type?: NotificationType | string;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

function getNotificationTitle(notification: Notification): string {
  if (notification.title?.trim()) {
    return notification.title.trim();
  }

  switch (notification.type) {
    case "CONTRIBUTION":
      return "Nouvelle contribution";
    case "RETRAIT":
      return "Retrait enregistré";
    case "MEMBRE_AJOUTE":
      return "Membre ajouté";
    case "MEMBRE_RETIRE":
      return "Membre retiré";
    case "OBJ_ATTEINT":
      return "Objectif atteint";
    case "OBJ_RAPPEL":
      return "Rappel d'objectif";
    case "COMPTE_CREER":
      return "Compte créé";
    case "COMPTE_SUPP":
      return "Compte supprimé";
    default:
      return "Notification";
  }
}

function getNotificationMessage(notification: Notification): string {
  if (notification.message?.trim()) {
    return notification.message.trim();
  }

  switch (notification.type) {
    case "CONTRIBUTION":
      return "Une nouvelle contribution a été enregistrée.";
    case "RETRAIT":
      return "Un retrait a été enregistré sur le compte.";
    case "MEMBRE_AJOUTE":
      return "Un membre a été ajouté au compte partagé.";
    case "MEMBRE_RETIRE":
      return "Un membre a été retiré du compte partagé.";
    case "OBJ_ATTEINT":
      return "L'objectif d'épargne a été atteint.";
    case "OBJ_RAPPEL":
      return "Un rappel concernant un objectif est disponible.";
    case "COMPTE_CREER":
      return "Un nouveau compte partagé a été créé.";
    case "COMPTE_SUPP":
      return "Un compte partagé a été supprimé.";
    default:
      return "Vous avez reçu une nouvelle notification.";
  }
}

function getNotificationIconName(notification: Notification):
  | "cash-plus"
  | "cash-remove"
  | "account-plus"
  | "account-remove"
  | "target"
  | "bell-ring"
  | "folder-plus"
  | "folder-remove"
  | "check-circle"
  | "bell"
  | "information-outline" {
  if (notification.isRead) {
    return "check-circle";
  }

  switch (notification.type) {
    case "CONTRIBUTION":
      return "cash-plus";
    case "RETRAIT":
      return "cash-remove";
    case "MEMBRE_AJOUTE":
      return "account-plus";
    case "MEMBRE_RETIRE":
      return "account-remove";
    case "OBJ_ATTEINT":
      return "target";
    case "OBJ_RAPPEL":
      return "bell-ring";
    case "COMPTE_CREER":
      return "folder-plus";
    case "COMPTE_SUPP":
      return "folder-remove";
    default:
      return "bell";
  }
}

function getNotificationIconColor(
  notification: Notification,
  theme: AppTheme,
): string {
  if (notification.isRead) {
    return theme.colors.outline;
  }

  switch (notification.type) {
    case "CONTRIBUTION":
      return theme.colors.tertiary;
    case "RETRAIT":
    case "COMPTE_SUPP":
    case "MEMBRE_RETIRE":
      return theme.colors.error;
    case "MEMBRE_AJOUTE":
    case "COMPTE_CREER":
      return theme.colors.primary;
    case "OBJ_ATTEINT":
      return theme.colors.secondary;
    case "OBJ_RAPPEL":
      return theme.colors.primary;
    default:
      return theme.colors.error;
  }
}

const MODULE = "NotificationsScreen";
type Props = BottomTabScreenProps<TabParamList, "NotificationsTab">;

const NotificationsScreen: React.FC<Props> = () => {
  const theme = useTheme<AppTheme>();
  const { width } = useWindowDimensions();
  const { refresh: refreshBadge } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isWebLayout = width > 768;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, []),
  );

  const loadNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logger.info(MODULE, "Chargement des notifications");

      const data = await getNotifications();
      let notifList: Notification[] = [];

      if (Array.isArray(data)) {
        notifList = data;
      } else if (
        (data as Record<string, unknown>).data &&
        Array.isArray((data as Record<string, unknown>).data)
      ) {
        notifList = (data as Record<string, unknown>).data as Notification[];
      } else if (
        (data as Record<string, unknown>).notifications &&
        Array.isArray((data as Record<string, unknown>).notifications)
      ) {
        notifList = (data as Record<string, unknown>)
          .notifications as Notification[];
      } else if ((data as Record<string, unknown>)[0]) {
        notifList = Object.values(
          data as Record<string, unknown>,
        ) as Notification[];
      }

      setNotifications(notifList);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, "Erreur chargement notifications", err);
      Alert.alert("Erreur", "Impossible de charger les notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string): Promise<void> => {
    try {
      await markNotificationAsRead(id);
      setNotifications((notif) =>
        notif.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      refreshBadge();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de marquer la notification");
    }
  };

  const handleMarkAsUnread = async (id: string): Promise<void> => {
    try {
      await markNotificationAsUnread(id);
      setNotifications((notif) =>
        notif.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
      refreshBadge();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de marquer comme non lue");
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((notif) => notif.map((n) => ({ ...n, isRead: true })));
      refreshBadge();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de marquer toutes les notifications");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <ScreenHeader
        gradient="notifications"
        title="Notifications"
        subtitle={`${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
        rightContent={
          unreadCount > 0 && (
            <Chip
              icon="bell"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {unreadCount}
              </Text>
            </Chip>
          )
        }
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: isWebLayout ? 32 : 16,
          paddingVertical: 24,
        }}
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
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
              Marquer tout comme lu
            </Text>
            <MaterialCommunityIcons
              name="check-all"
              size={20}
              color={theme.colors.primary}
            />
          </Pressable>
        )}

        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              backgroundColor: theme.colors.secondaryContainer,
              borderRadius: 12,
              paddingHorizontal: 24,
            }}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={48}
              color={theme.colors.secondary}
            />
            <Text
              variant="headlineSmall"
              style={{
                color: theme.colors.secondary,
                marginTop: 16,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              📭 Aucune notification
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Vous gérez bien vos comptes!
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: isWebLayout ? "row" : "column",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 80,
            }}
          >
            {notifications.map((notif) => (
              <View
                key={notif.id}
                style={{
                  width: isWebLayout ? "48%" : "100%",
                  backgroundColor: theme.colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: notif.isRead
                    ? theme.colors.outlineVariant
                    : theme.colors.error,
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: "700",
                        color: theme.colors.onBackground,
                        marginBottom: 4,
                      }}
                    >
                      {getNotificationTitle(notif)}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        lineHeight: 18,
                      }}
                    >
                      {getNotificationMessage(notif)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={getNotificationIconName(notif)}
                    size={24}
                    color={getNotificationIconColor(notif, theme)}
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopColor: theme.colors.outline,
                    borderTopWidth: 1,
                  }}
                >
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {!notif.isRead && (
                      <Pressable
                        onPress={() => handleMarkAsRead(notif.id)}
                        style={{ padding: 4 }}
                      >
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </Pressable>
                    )}
                    {notif.isRead && (
                      <Pressable
                        onPress={() => handleMarkAsUnread(notif.id)}
                        style={{ padding: 4 }}
                      >
                        <MaterialCommunityIcons
                          name="bell"
                          size={20}
                          color={theme.colors.outline}
                        />
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => {
                        deleteNotification(notif.id)
                          .then(() => {
                            setNotifications((notifList) => notifList.filter((n) => n.id !== notif.id));
                            refreshBadge();
                          })
                          .catch(() => Alert.alert("Erreur", "Impossible de supprimer la notification"));
                      }}
                      style={{ padding: 4 }}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={20}
                        color={theme.colors.error}
                      />
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
            position: "absolute",
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
