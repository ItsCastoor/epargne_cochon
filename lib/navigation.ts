// lib/navigation.ts - Types centralisés pour React Navigation

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DashboardTab: undefined;
  AccountsTab: undefined;
  NotificationsTab: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  TestRegister: undefined;
};

export type TabParamList = {
  DashboardTab: undefined;
  AccountsTab: undefined;
  NotificationsTab: undefined;
};

export type AppStackParamList = {
  HomeStack: undefined;
  CreateAccount: undefined;
  AccountDetail: { id: string };
};

