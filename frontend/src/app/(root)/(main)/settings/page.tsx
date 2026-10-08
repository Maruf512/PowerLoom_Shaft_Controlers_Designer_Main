"use client";

import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import useUser from "@/hooks/useUser";
import apiClient from "@/lib/apiClient";
import { AuthUserResponseType } from "@/types/auth";
import Image from "next/image";
import { useEffect, useState } from "react";

const SettingsPage = () => {
  const toast = useToast();
  const { user, refresh } = useUser();
  const [profile, setProfile] = useState<AuthUserResponseType | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await apiClient<AuthUserResponseType>(
        "auth/profile"
      );
      if (data && !error) {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (user) {
      setProfile((prev) => prev ?? user);
      if (!name && user.name) setName(user.name);
      if (!phone && user.phone) setPhone(user.phone || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const avatarSrc =
    preview || profile?.avatar_url || user?.avatar_url || "/profile.png";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Name is required", "error");
      return;
    }
    setSaving(true);
    const form = new FormData();
    form.append("name", name.trim());
    form.append("phone", phone.trim());
    if (avatarFile) form.append("avatar", avatarFile);

    const { data, error } = await apiClient<AuthUserResponseType>(
      "auth/profile",
      { method: "PATCH", body: form }
    );
    setSaving(false);
    if (error || !data) {
      toast(typeof error === "string" ? error : "Failed to update profile", "error");
      return;
    }
    setProfile(data);
    setAvatarFile(null);
    await refresh();
    toast("Profile updated successfully", "success");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters", "error");
      return;
    }
    setPwSaving(true);
    const { error } = await apiClient("auth/password/change", {
      method: "POST",
      body: { old_password: oldPassword, new_password: newPassword },
    });
    setPwSaving(false);
    if (error) {
      toast(typeof error === "string" ? error : "Password change failed", "error");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    toast("Password updated successfully", "success");
  };

  if (loading) return <p className="text-sm text-basec">Loading settings…</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-surface border border-muted rounded-radius-lg p-6">
        <h1 className="text-lg font-semibold">Profile settings</h1>
        <p className="text-sm text-basec mt-1">
          Update your photo, name and phone number.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-muted">
              <Image
                src={avatarSrc}
                alt="avatar"
                layout="fill"
                objectFit="cover"
                unoptimized={avatarSrc.startsWith("http") || avatarSrc.startsWith("blob:")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Profile photo</label>
              <input
                type="file"
                accept="image/*"
                className="block mt-1 text-xs"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-basec mt-1">JPG / PNG, square works best.</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary/50 text-sm opacity-70"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 ..."
                className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary text-sm"
              />
            </div>
          </div>

          <Button type="submit" isLoading={saving}>Save changes</Button>
        </form>
      </div>

      <div className="bg-surface border border-muted rounded-radius-lg p-6">
        <h2 className="text-base font-semibold">Change password</h2>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Current password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary text-sm"
              />
            </div>
          </div>
          <Button type="submit" variant="outline" isLoading={pwSaving}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
