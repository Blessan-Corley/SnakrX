import { useCallback, useEffect, useRef, useState } from 'react';
import * as sound from '@/utils/sound';

export const useHeaderController = ({ logout, navigate }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(sound.getMuted());
  const userMenuRef = useRef(null);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/landing');
  }, [logout, navigate]);

  const handleToggleSound = useCallback(() => {
    const newMutedState = sound.toggleMute();
    setSoundMuted(newMutedState);
    if (!newMutedState) {
      sound.playClick();
    }
  }, []);

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((previous) => !previous);
  }, []);

  useEffect(() => {
    const unsubscribe = sound.subscribeSoundSettings(({ muted }) => {
      setSoundMuted(muted);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [userMenuOpen]);

  return {
    closeUserMenu,
    handleLogout,
    handleToggleSound,
    soundMuted,
    toggleUserMenu,
    userMenuOpen,
    userMenuRef
  };
};
