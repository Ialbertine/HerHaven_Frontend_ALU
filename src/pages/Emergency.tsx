import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Phone,
  Edit2,
  Trash2,
  AlertCircle,
  Shield,
  X,
  Heart,
  Users,
  Briefcase,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  type EmergencyContact,
} from "@/apis/emergency";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser } from "@/apis/auth";
import EmergencyCallButton from "@/components/EmergencyCall";
import QuickExitButton from "@/components/QuickExit";
import { useModal } from "@/contexts/useModal";

interface RelationshipConfig {
  value: "family" | "friend" | "partner" | "colleague" | "other";
  label: string;
  icon: LucideIcon;
  color: string;
}

interface FormData {
  name: string;
  relationship: "family" | "friend" | "partner" | "colleague" | "other";
  phoneNumber: string;
  notes: string;
}

const EmergencyContactsManager: React.FC = () => {
  const { showAlert, showDeleteConfirm } = useModal();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userName, setUserName] = useState<string>("User");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    relationship: "other",
    phoneNumber: "",
    notes: "",
  });

  const relationships: RelationshipConfig[] = [
    { value: "family", label: "Family", icon: Heart, color: "text-rose-500" },
    { value: "friend", label: "Friend", icon: Users, color: "text-blue-500" },
    { value: "partner", label: "Partner", icon: Heart, color: "text-pink-500" },
    {
      value: "colleague",
      label: "Colleague",
      icon: Briefcase,
      color: "text-purple-500",
    },
    { value: "other", label: "Other", icon: User, color: "text-gray-500" },
  ];

  useEffect(() => {
    fetchContacts();
    // Get current user info
    const user = getCurrentUser();
    if (user) {
      setUserName(user.username || "User");
    }
  }, []);

  const fetchContacts = async (): Promise<void> => {
    setFetchLoading(true);
    try {
      const response = await getEmergencyContacts();
      if (response.success && response.data) {
        setContacts(response.data);
      } else {
        setError(response.message || "Failed to fetch contacts");
      }
    } catch (err) {
      setError("An error occurred while fetching contacts");
      console.error("Fetch contacts error:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: "",
      relationship: "other",
      phoneNumber: "",
      notes: "",
    });
    setEditingContact(null);
    setError("");
  };

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    setError("");

    // Validate phone number format
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError(
        "Phone number must be 10 digits long"
      );
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    try {
      if (editingContact) {
        const response = await updateEmergencyContact(
          editingContact._id,
          formData
        );
        if (response.success && response.data) {
          setContacts(
            contacts.map((c) =>
              c._id === editingContact._id ? response.data! : c
            )
          );
          setShowAddModal(false);
          resetForm();
          showAlert("Contact updated successfully!", "Success", "success");
        } else {
          setError(response.message || "Failed to update contact");
          setLoading(false);
          return;
        }
      } else {
        const response = await createEmergencyContact(formData);
        if (response.success && response.data) {
          setContacts([...contacts, response.data]);
          setShowAddModal(false);
          resetForm();
          showAlert("Contact added successfully!", "Success", "success");
        } else {
          setError(response.message || "Failed to create contact");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError("An error occurred");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: EmergencyContact): void => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber,
      notes: contact.notes || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (contactId: string): Promise<void> => {
    showDeleteConfirm(
      "Are you sure you want to delete this contact? This action cannot be undone.",
      async () => {
        setLoading(true);
        try {
          const response = await deleteEmergencyContact(contactId);
          if (response.success) {
            setContacts(contacts.filter((c) => c._id !== contactId));
            showAlert("Contact deleted successfully!", "Success", "success");
          } else {
            showAlert(
              response.message || "Failed to delete contact",
              "Error",
              "danger"
            );
          }
        } catch (err) {
          showAlert(
            "An error occurred while deleting contact",
            "Error",
            "danger"
          );
          console.error("Delete error:", err);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getRelationshipConfig = (relationship: string): RelationshipConfig => {
    return (
      relationships.find((r) => r.value === relationship) || relationships[4]
    );
  };

  if (fetchLoading) {
    return (
      <DashboardLayout userType="user" userName={userName}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading contacts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="user" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Emergency Contacts
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your trusted contacts for SOS alerts
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Info Banner */}
        {contacts.length === 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Add Your First Emergency Contact
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Emergency contacts will receive alerts when you trigger an
                  SOS. Add trusted family members, friends, or colleagues who
                  can respond quickly in case of emergency. You can add multiple
                  contacts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Grid */}
        {contacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => {
              const relationConfig = getRelationshipConfig(
                contact.relationship
              );
              const RelationIcon = relationConfig.icon;

              return (
                <div
                  key={contact._id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${relationConfig.color} bg-opacity-10 p-3 rounded-xl`}
                    >
                      <RelationIcon
                        className={`w-6 h-6 ${relationConfig.color}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete contact"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {contact.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 capitalize">
                    {contact.relationship}
                  </p>

                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm">
                      {contact.phoneNumber}
                    </span>
                  </div>

                  {contact.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-3">
                      {contact.notes}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Added {new Date(contact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {contacts.length === 0 && !fetchLoading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
              <UserPlus className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Emergency Contacts
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by adding your first emergency contact. They'll be notified
              when you use the SOS feature.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Add Your First Contact
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                    placeholder="John Doe"
                    maxLength={100}
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Relationship *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {relationships.map((rel) => {
                      const Icon = rel.icon;
                      return (
                        <button
                          key={rel.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              relationship: rel.value,
                            })
                          }
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.relationship === rel.value
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 mx-auto mb-2 ${rel.color}`}
                          />
                          <span className="text-sm font-medium">
                            {rel.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-colors font-mono"
                    placeholder="07xxxxxxxxx"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="Additional information about this contact..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.notes.length}/500 characters
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Saving..."
                      : editingContact
                      ? "Update Contact"
                      : "Add Contact"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Call and Quick Exit Buttons */}
        <EmergencyCallButton />
        <QuickExitButton />
      </div>
    </DashboardLayout>
  );
};

export default EmergencyContactsManager;
