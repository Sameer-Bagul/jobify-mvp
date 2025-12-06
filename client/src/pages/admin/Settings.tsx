import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Save, Loader2, Mail, CreditCard, Shield } from 'lucide-react';
import api from '@/lib/api';

interface AdminSettings {
  dailyEmailLimit: number;
  proEmailLimit: number;
  premiumEmailLimit: number;
  subscriptionPrices: {
    pro: number;
    premium: number;
  };
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    dailyEmailLimit: 20,
    proEmailLimit: 100,
    premiumEmailLimit: 500,
    subscriptionPrices: {
      pro: 499,
      premium: 999,
    },
    maintenanceMode: false,
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      await api.put('/admin/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Configure platform settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Email Limits</h2>
                <p className="text-sm text-gray-400">Configure daily email limits per plan</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Free Plan (emails/day)
                </label>
                <input
                  type="number"
                  value={settings.dailyEmailLimit}
                  onChange={(e) => setSettings({ ...settings, dailyEmailLimit: parseInt(e.target.value) || 0 })}
                  className="input-dark w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pro Plan (emails/day)
                </label>
                <input
                  type="number"
                  value={settings.proEmailLimit}
                  onChange={(e) => setSettings({ ...settings, proEmailLimit: parseInt(e.target.value) || 0 })}
                  className="input-dark w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Premium Plan (emails/day)
                </label>
                <input
                  type="number"
                  value={settings.premiumEmailLimit}
                  onChange={(e) => setSettings({ ...settings, premiumEmailLimit: parseInt(e.target.value) || 0 })}
                  className="input-dark w-full"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Subscription Pricing</h2>
                <p className="text-sm text-gray-400">Set monthly subscription prices (in INR)</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pro Plan Price (₹)
                </label>
                <input
                  type="number"
                  value={settings.subscriptionPrices.pro}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    subscriptionPrices: { 
                      ...settings.subscriptionPrices, 
                      pro: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="input-dark w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Premium Plan Price (₹)
                </label>
                <input
                  type="number"
                  value={settings.subscriptionPrices.premium}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    subscriptionPrices: { 
                      ...settings.subscriptionPrices, 
                      premium: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="input-dark w-full"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">System Settings</h2>
                <p className="text-sm text-gray-400">Configure platform behavior</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700 cursor-pointer">
                <div>
                  <p className="text-white font-medium">Maintenance Mode</p>
                  <p className="text-sm text-gray-400">Temporarily disable the platform for updates</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700 cursor-pointer">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">Send system notifications to admins</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
