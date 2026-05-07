import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, useTheme, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppStackParamList } from '@/lib/navigation';
import {
  getSharedAccount,
  deleteSharedAccount,
  getGoals,
  deleteGoal,
  getContributions,
  createContribution,
  createWithdrawal,
  inviteMember,
  getAccountMembers,
  removeMember
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { ScreenHeader, CustomButton, CustomCard } from '@/components';
import { generateColorFromId } from '@/lib/colors';

type Props = NativeStackScreenProps<AppStackParamList, 'AccountDetail'>;

interface Account {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  createdAt?: string;
  members?: Array<{ id: string; email: string; firstName: string; lastName: string; role: string }>;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
  currentAmount: number;
}

interface Contribution {
  id: string;
  amount: number;
  description?: string;
  createdAt: string;
  userId: string;
  User?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

type TabType = 'details' | 'members' | 'goals' | 'contributions';

const MODULE = 'AccountDetailScreen';

const AccountDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params as { id: string };
  const theme = useTheme();
  const [account, setAccount] = useState<Account | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  const [inviteEmail, setInviteEmail] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionDesc, setContributionDesc] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalDesc, setWithdrawalDesc] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [accountData, membersData, goalsData, contributionsData] = await Promise.all([
        getSharedAccount(id),
        getAccountMembers(id),
        getGoals(id),
        getContributions(id),
      ]);

      let parsedAccount: Account | undefined;
      const acctData = accountData as any;
      if (acctData && typeof acctData === 'object' && acctData.id) {
        parsedAccount = acctData as Account;
      } else if (acctData?.data?.id) {
        parsedAccount = acctData.data as Account;
      } else if (acctData?.account?.id) {
        parsedAccount = acctData.account as Account;
      } else if (acctData?.shared_account?.id) {
        parsedAccount = acctData.shared_account as Account;
      }

      if (!parsedAccount) throw new Error('Format non reconnu');

      // Parse members from separate endpoint
      let parsedMembers: Array<{ id: string; email: string; firstName: string; lastName: string; role: string }> = [];
      if (Array.isArray(membersData)) {
        parsedMembers = membersData;
      } else if ((membersData as Record<string, unknown>).data && Array.isArray((membersData as Record<string, unknown>).data)) {
        parsedMembers = (membersData as Record<string, unknown>).data as Array<{ id: string; email: string; firstName: string; lastName: string; role: string }>;
      } else if ((membersData as Record<string, unknown>).members && Array.isArray((membersData as Record<string, unknown>).members)) {
        parsedMembers = (membersData as Record<string, unknown>).members as Array<{ id: string; email: string; firstName: string; lastName: string; role: string }>;
      } else if ((membersData as Record<string, unknown>)[0]) {
        parsedMembers = Object.values(membersData as Record<string, unknown>) as Array<{ id: string; email: string; firstName: string; lastName: string; role: string }>;
      }
      parsedAccount.members = parsedMembers;

      let parsedGoals: Goal[] = [];
      if (Array.isArray(goalsData)) {
        parsedGoals = goalsData;
      } else if ((goalsData as Record<string, unknown>).data && Array.isArray((goalsData as Record<string, unknown>).data)) {
        parsedGoals = (goalsData as Record<string, unknown>).data as Goal[];
      } else if ((goalsData as Record<string, unknown>).goals && Array.isArray((goalsData as Record<string, unknown>).goals)) {
        parsedGoals = (goalsData as Record<string, unknown>).goals as Goal[];
      } else if ((goalsData as Record<string, unknown>)[0]) {
        parsedGoals = Object.values(goalsData as Record<string, unknown>) as Goal[];
      }

      let parsedContributions: Contribution[] = [];
      if (Array.isArray(contributionsData)) {
        parsedContributions = contributionsData;
      } else if ((contributionsData as Record<string, unknown>).data && Array.isArray((contributionsData as Record<string, unknown>).data)) {
        parsedContributions = (contributionsData as Record<string, unknown>).data as Contribution[];
      } else if ((contributionsData as Record<string, unknown>).contributions && Array.isArray((contributionsData as Record<string, unknown>).contributions)) {
        parsedContributions = (contributionsData as Record<string, unknown>).contributions as Contribution[];
      } else if ((contributionsData as Record<string, unknown>)[0]) {
        parsedContributions = Object.values(contributionsData as Record<string, unknown>) as Contribution[];
      }

      setAccount(parsedAccount);
      setGoals(parsedGoals);
      setContributions(parsedContributions);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur chargement', err);
      Alert.alert('Erreur', 'Impossible de charger le compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = (): void => {
    Alert.alert('Confirmation', 'Êtes-vous sûr?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: deleteAccount },
    ]);
  };

  const deleteAccount = async (): Promise<void> => {
    if (!account) return;
    try {
      setIsDeleting(true);
      await deleteSharedAccount(account.id);
      Alert.alert('Succès', 'Compte supprimé', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInviteMember = async (): Promise<void> => {
    if (!account || !inviteEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un email');
      return;
    }
    try {
      await inviteMember(account.id, inviteEmail);
      Alert.alert('Succès', 'Invitation envoyée!');
      setInviteEmail('');
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const statusCode = (error as any)?.status;

      // Vérifier le code d'erreur HTTP
      switch (statusCode) {
        case 403:
          Alert.alert('Erreur', 'Seul le propriétaire peut inviter');
          break;
        case 404:
          Alert.alert('Erreur', 'L\'adresse email est introuvable');
          break;
        case 409:
          Alert.alert('Erreur', 'L\'utilisateur est déjà membre');
          break;
        default:
          // Si pas de code HTTP, afficher le message
          Alert.alert('Erreur', errorMessage);
      }
    }
  };

  const handleAddContribution = async (): Promise<void> => {
    if (!account || !contributionAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un montant');
      return;
    }
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    try {
      await createContribution(account.id, amount, contributionDesc);
      Alert.alert('Succès', 'Contribution ajoutée!');
      setContributionAmount('');
      setContributionDesc('');
      await loadData();
    } catch (error) {
      Alert.alert('Erreur', String(error));
    }
  };

  const handleWithdrawal = async (): Promise<void> => {
    if (!account || !withdrawalAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un montant');
      return;
    }
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    try {
      await createWithdrawal(account.id, amount, withdrawalDesc);
      Alert.alert('Succès', 'Retrait enregistré!');
      setWithdrawalAmount('');
      setWithdrawalDesc('');
      await loadData();
    } catch (error) {
      Alert.alert('Erreur', String(error));
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string): void => {
    Alert.alert('Confirmation', `Êtes-vous sûr de vouloir retirer ${memberName} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => removeMemberConfirmed(memberId) },
    ]);
  };

  const removeMemberConfirmed = async (memberId: string): Promise<void> => {
    if (!account) return;
    try {
      await removeMember(account.id, memberId);
      Alert.alert('Succès', 'Membre retiré du compte');
      await loadData();
    } catch (error) {
      Alert.alert('Erreur', String(error));
    }
  };

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (!account) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}><Text>Compte non trouvé</Text></View>;
  }

  const progress = (account.currentAmount / account.targetAmount) * 100;
  const remaining = account.targetAmount - account.currentAmount;
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'details', label: 'Détails', icon: 'information-outline' },
    { id: 'members', label: 'Membres', icon: 'account-multiple' },
    { id: 'goals', label: 'Objectifs', icon: 'bullseye' },
    { id: 'contributions', label: 'Contributions', icon: 'cash-plus' },
  ];

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <ScreenHeader gradient="dashboard" title={account.name} subtitle={account.description} />

      {/* Back Button */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14 }}>Retour</Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
        <View style={{ flexDirection: 'row', gap: 0}}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderBottomWidth: 3,
                borderBottomColor: activeTab === tab.id ? theme.colors.primary : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.id ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text style={{ fontWeight: activeTab === tab.id ? '700' : '600', fontSize: 12, color: activeTab === tab.id ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={{ flex:1, paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
        {activeTab === 'details' && (
          <>
            <CustomCard>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View><Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Épargné</Text><Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.primary }}>{account.currentAmount.toFixed(2)} {account.currency}</Text></View>
                  <Text variant="headlineLarge" style={{ color: theme.colors.tertiary }}>{progress.toFixed(0)}%</Text>
                </View>

                {/* Barre de progression colorée par contributeur */}
                <View style={{ height: 8, backgroundColor: theme.colors.surfaceVariant, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' }}>
                  {account.members && account.members.length > 0 && contributions.length > 0 && account.targetAmount > 0 ? (
                    <>
                      {account.members.map((member) => {
                        const memberContributions = contributions.filter(c => c.userId === member.id);
                        const memberTotal = memberContributions.reduce((sum, c) => sum + c.amount, 0);
                        const memberWidthPercent = (memberTotal / account.targetAmount) * 100;

                        return memberWidthPercent > 0 ? (
                          <View
                            key={member.id}
                            style={{
                              height: '100%',
                              width: `${memberWidthPercent}%`,
                              backgroundColor: generateColorFromId(member.id),
                            }}
                          />
                        ) : null;
                      })}
                      <View
                        style={{
                          height: '100%',
                          width: `${((account.targetAmount - account.currentAmount) / account.targetAmount) * 100}%`,
                          backgroundColor: theme.colors.surfaceVariant,
                        }}
                      />
                    </>
                  ) : (
                    <View style={{ height: '100%', backgroundColor: theme.colors.tertiary, width: '100%' }} />
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="labelSmall">Objectif: {account.targetAmount.toFixed(2)} {account.currency}</Text><Text variant="labelSmall">À épargner: {remaining.toFixed(2)} {account.currency}</Text></View>
              </View>
            </CustomCard>
            <CustomCard>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Devise</Text><Text variant="bodyMedium" style={{ fontWeight: '600' }}>{account.currency}</Text></View>
                {account.createdAt && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Créé le</Text><Text variant="bodyMedium" style={{ fontWeight: '600' }}>{new Date(account.createdAt).toLocaleDateString('fr-FR')}</Text></View>}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Membres</Text><Chip>{account.members?.length || 0}</Chip></View>
              </View>
            </CustomCard>

            {/* Légende des contributeurs */}
            {account.members && account.members.length > 0 && (
              <CustomCard>
                <View style={{ gap: 12 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>📋 Légende des contributeurs</Text>
                  <View style={{ gap: 8 }}>
                    {account.members.map((member) => (
                      <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: generateColorFromId(member.id),
                        }} />
                        <Text variant="bodySmall" style={{ flex: 1, fontWeight: '500' }}>{member.firstName} {member.lastName}</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{member.role?.toLowerCase() === 'owner' ? 'propriétaire' : 'contributeur'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </CustomCard>
            )}

            <CustomButton label={isDeleting ? 'Suppression...' : '🗑️ Supprimer'} onPress={handleDeleteAccount} variant="danger" loading={isDeleting} disabled={isDeleting} />
          </>
        )}

        {activeTab === 'members' && (
          <>
            {account.members && account.members.length > 0 && (
              <CustomCard>
                <View style={{ gap: 12 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>Membres</Text>
                  <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.outline }} />
                  <View style={{ gap: 8 }}>
                    {account.members.map((member) => (
                      <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
                        <View style={{ flex: 1 }}><Text variant="bodyMedium" style={{ fontWeight: '600' }}>{member.firstName} {member.lastName}</Text><Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{member.email}</Text><Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>Rôle: {member.role?.toLowerCase() === 'owner' ? 'propriétaire' : 'contributeur'}</Text></View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Chip style={{ backgroundColor: generateColorFromId(member.id) }}>{member.role?.toLowerCase() === 'owner' ? 'propriétaire' : 'contributeur'}</Chip>
                          <Pressable onPress={() => handleRemoveMember(member.id, `${member.firstName} ${member.lastName}`)} style={{ padding: 8 }}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </CustomCard>
            )}
            <CustomCard>
              <View style={{ gap: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>Inviter</Text>
                <TextInput placeholder="email@example.com" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.onBackground }} placeholderTextColor={theme.colors.onSurfaceVariant} />
                <CustomButton label="📧 Envoyer" onPress={handleInviteMember} variant="secondary" />
              </View>
            </CustomCard>
          </>
        )}

        {activeTab === 'goals' && (
          goals.length === 0 ? (
            <CustomCard style={{ backgroundColor: theme.colors.tertiaryContainer }}><Text variant="bodyMedium" style={{ color: theme.colors.tertiary, textAlign: 'center' }}>🎯 Aucun objectif</Text></CustomCard>
          ) : (
            <View style={{ gap: 12 }}>
              {goals.map((goal) => (
                <CustomCard key={goal.id}>
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="titleMedium" style={{ fontWeight: '700', flex: 1 }}>{goal.name}</Text><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{new Date(goal.deadline).toLocaleDateString('fr-FR')}</Text></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="bodySmall">{goal.currentAmount} € / {goal.targetAmount} €</Text><Text variant="labelSmall" style={{ color: theme.colors.secondary, fontWeight: '600' }}>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</Text></View>
                    <Pressable onPress={() => deleteGoal(id, goal.id).then(() => loadData()).catch(e => Alert.alert('Erreur', String(e)))} style={{ paddingVertical: 8 }}><Text style={{ color: theme.colors.error, fontWeight: '600' }}>🗑️ Supprimer</Text></Pressable>
                  </View>
                </CustomCard>
              ))}
            </View>
          )
        )}

        {activeTab === 'contributions' && (
          <>
            <CustomCard>
              <View style={{ gap: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>➕ Ajouter une contribution</Text>
                <TextInput placeholder="Montant" value={contributionAmount} onChangeText={setContributionAmount} keyboardType="decimal-pad" style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.onBackground }} placeholderTextColor={theme.colors.onSurfaceVariant} />
                <TextInput placeholder="Description" value={contributionDesc} onChangeText={setContributionDesc} multiline numberOfLines={2} style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.onBackground }} placeholderTextColor={theme.colors.onSurfaceVariant} />
                <CustomButton label="➕ Ajouter" onPress={handleAddContribution} variant="secondary" />
              </View>
            </CustomCard>

            <CustomCard>
              <View style={{ gap: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>➖ Enregistrer un retrait</Text>
                <TextInput placeholder="Montant" value={withdrawalAmount} onChangeText={setWithdrawalAmount} keyboardType="decimal-pad" style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.onBackground }} placeholderTextColor={theme.colors.onSurfaceVariant} />
                <TextInput placeholder="Motif du retrait" value={withdrawalDesc} onChangeText={setWithdrawalDesc} multiline numberOfLines={2} style={{ borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.onBackground }} placeholderTextColor={theme.colors.onSurfaceVariant} />
                <CustomButton label="➖ Enregistrer le retrait" onPress={handleWithdrawal} variant="danger" />
              </View>
            </CustomCard>
            {contributions.length === 0 ? (
              <CustomCard style={{ backgroundColor: theme.colors.primaryContainer }}><Text variant="bodyMedium" style={{ color: theme.colors.primary, textAlign: 'center' }}>💰 Aucune contribution</Text></CustomCard>
            ) : (
              <>
                {/* Légende pour contributions */}
                {account.members && account.members.length > 0 && (
                  <CustomCard style={{ backgroundColor: theme.colors.surface }}>
                    <View style={{ gap: 8 }}>
                      <Text variant="labelSmall" style={{ fontWeight: '600', color: theme.colors.onSurfaceVariant }}>📍 Couleur par contributeur:</Text>
                      <View style={{ flexDirection: 'column', gap: 8 }}>
                        {account.members.map((member) => (
                          <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{
                              width: 16,
                              height: 16,
                              borderRadius: 8,
                              backgroundColor: generateColorFromId(member.id),
                            }} />
                            <Text variant="labelSmall" style={{ fontSize: 11 }}>{member.firstName} {member.lastName}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </CustomCard>
                )}

                <View style={{ gap: 12 }}>
                  {contributions.map((contrib) => {
                    // Trouver le membre qui a contribué en matchant par userId
                    const contributor = account.members?.find(m => m.id === contrib.userId);
                    const memberColor = contributor ? generateColorFromId(contributor.id) : theme.colors.primary;
                    const displayName = contrib.User
                      ? `${contrib.User.firstName} ${contrib.User.lastName}`.trim()
                      : contributor
                      ? `${contributor.firstName} ${contributor.lastName}`
                      : 'Anonyme';

                    return (
                      <CustomCard key={contrib.id} style={{ borderLeftColor: memberColor, borderLeftWidth: 4 }}>
                        <View style={{ gap: 8 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="titleSmall" style={{ color: memberColor, fontWeight: '700', flex: 1 }}>👤 {displayName}</Text>
                            <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.tertiary }}>{contrib.amount.toFixed(2)} {account.currency}</Text>
                          </View>
                          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{new Date(contrib.createdAt).toLocaleDateString('fr-FR')}</Text>
                          {contrib.description && <Text variant="bodySmall" style={{ marginTop: 4, fontStyle: 'italic', color: theme.colors.onSurfaceVariant }}>{contrib.description}</Text>}
                        </View>
                      </CustomCard>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AccountDetailScreen;

