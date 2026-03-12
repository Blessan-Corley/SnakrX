export const buildInitialSupportFormData = ({
  user = null,
  userProfile = null,
  overrides = {}
} = {}) => ({
  name: userProfile?.displayName || '',
  email: user?.email || '',
  username: userProfile?.username || '',
  category: 'other',
  title: '',
  description: '',
  device: '',
  ...overrides
});

export const mergeSupportIdentityFields = (previous, {
  user = null,
  userProfile = null
} = {}) => ({
  ...previous,
  name: userProfile?.displayName || previous.name,
  email: user?.email || previous.email,
  username: userProfile?.username || previous.username
});

export const buildSupportCategoryLabelMap = (options = []) => (
  Object.fromEntries(options.map((option) => [option.value, option.label]))
);

export const validateSupportFormData = (formData) => (
  Boolean(formData?.email && formData?.description?.trim())
);
