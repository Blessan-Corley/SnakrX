import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfileHeaderIdentity from './ProfileHeaderIdentity.jsx';

describe('ProfileHeaderIdentity', () => {
  it('renders fallback member labels when profile dates are missing', () => {
    render(
      <ProfileHeaderIdentity
        avatarInputRef={{ current: null }}
        createdAtDate={null}
        editForm={{ displayName: 'Bala' }}
        editing={false}
        handleAvatarSelected={vi.fn()}
        handleCancelEdit={vi.fn()}
        handleRemoveAvatar={vi.fn()}
        handleSaveEdit={vi.fn()}
        handleStartEdit={vi.fn()}
        handleUploadAvatarClick={vi.fn()}
        lastActiveDate={null}
        loading={false}
        membershipSummary="New player"
        setEditForm={vi.fn()}
        uploadingAvatar={false}
        userProfile={{ displayName: 'Bala', username: 'bala' }}
      />
    );

    expect(screen.getByText('Member since recently')).toBeInTheDocument();
    expect(screen.getByText('Last active recently')).toBeInTheDocument();
  });
});
