'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import * as api from '@/lib/api';

interface Goal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
}

interface Contribution {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface SharedAccount {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
}

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<SharedAccount | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showNewContribution, setShowNewContribution] = useState(false);

  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    deadline: '',
  });

  const [contributionForm, setContributionForm] = useState({
    amount: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountData, goalsData, contributionsData] = await Promise.all([
          api.getSharedAccount(accountId),
          api.getGoals(accountId),
          api.getContributions(accountId),
        ]);
        setAccount(accountData as SharedAccount);
        setGoals(goalsData as Goal[]);
        setContributions(contributionsData as Contribution[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur au chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal(
        accountId,
        goalForm.name,
        parseFloat(goalForm.targetAmount),
        goalForm.deadline,
        goalForm.description
      );
      setGoalForm({ name: '', description: '', targetAmount: '', deadline: '' });
      setShowNewGoal(false);
      // Recharger les goals
      const goalsData = await api.getGoals(accountId);
      setGoals(goalsData as Goal[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createContribution(
        accountId,
        parseFloat(contributionForm.amount),
        contributionForm.description
      );
      setContributionForm({ amount: '', description: '' });
      setShowNewContribution(false);
      // Recharger les contributions
      const contributionsData = await api.getContributions(accountId);
      setContributions(contributionsData as Contribution[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <Navbar />
        <div className="text-center py-12">Compte non trouvé</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">{account.name}</h1>
        <p className="text-gray-900 mb-6">{account.description}</p>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Progression */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Progression</h2>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{account.currentAmount} / {account.targetAmount} {account.currency}</span>
            <span className="text-gray-900">{Math.round((account.currentAmount / account.targetAmount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-linear-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
              style={{
                width: `${Math.min((account.currentAmount / account.targetAmount) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Objectifs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Objectifs</h2>
              <button
                onClick={() => setShowNewGoal(!showNewGoal)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                + Ajouter
              </button>
            </div>

            {showNewGoal && (
              <form onSubmit={handleAddGoal} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Nom"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                />
                <input
                  type="number"
                  placeholder="Montant cible"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                  step="0.01"
                />
                <input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Créer
                </button>
              </form>
            )}

            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-gray-600">Aucun objectif</p>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className="bg-white p-4 rounded-lg border">
                    <h3 className="font-bold">{goal.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>{goal.currentAmount} / {goal.targetAmount}</span>
                      <span>{goal.deadline}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
               )
              }
            </div>
          </div>

          {/* Contributions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Contributions</h2>
              <button
                onClick={() => setShowNewContribution(!showNewContribution)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                + Ajouter
              </button>
            </div>

            {showNewContribution && (
              <form onSubmit={handleAddContribution} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <input
                  type="number"
                  placeholder="Montant"
                  value={contributionForm.amount}
                  onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={contributionForm.description}
                  onChange={(e) => setContributionForm({ ...contributionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Ajouter
                </button>
              </form>
            )}

            <div className="space-y-2">
              {contributions.length === 0 ? (
                <p className="text-gray-600">Aucune contribution</p>
              ) : (
                contributions.map((contribution) => (
                  <div key={contribution.id} className="bg-white p-3 rounded-lg border text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{contribution.amount} {account.currency}</span>
                      <span className="text-gray-600">{new Date(contribution.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {contribution.description && (
                      <p className="text-gray-900 text-xs mt-1">{contribution.description}</p>
                    )}
                  </div>
                ))
              )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

