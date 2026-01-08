import { AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card.jsx';
import RegisterPageBackground from '@/components/auth/register/RegisterPageBackground.jsx';
import RegisterPageHeader from '@/components/auth/register/RegisterPageHeader.jsx';
import RegisterPageLinks from '@/components/auth/register/RegisterPageLinks.jsx';
import RegisterProgressIndicator from '@/components/auth/register/RegisterProgressIndicator.jsx';
import RegisterStepAccountDetails from '@/components/auth/register/RegisterStepAccountDetails.jsx';
import RegisterStepEmailVerification from '@/components/auth/register/RegisterStepEmailVerification.jsx';
import RegisterStepPassword from '@/components/auth/register/RegisterStepPassword.jsx';
import useRegisterFlow from './register/useRegisterFlow.js';

const RegisterPage = () => {
  const {
    currentStep,
    formData,
    handleKeyPress,
    handleResendOtp,
    handleSubmit,
    loading,
    nextStep,
    otpCode,
    otpSecondsLeft,
    otpSending,
    otpStatus,
    otpVerifying,
    prevStep,
    resendAvailableAt,
    setOtpCode,
    setShowConfirmPassword,
    setShowPassword,
    showConfirmPassword,
    showPassword,
    updateFormData,
    usernameAvailable,
    usernameChecking,
    validationErrors
  } = useRegisterFlow();

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <RegisterPageBackground />

      <div className="relative w-full max-w-md">
        <RegisterPageHeader />
        <RegisterProgressIndicator currentStep={currentStep} />

        <Card variant="glass" padding="lg" className="mb-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <RegisterStepAccountDetails
                  formData={formData}
                  handleKeyPress={handleKeyPress}
                  onNext={nextStep}
                  onUpdateFormData={updateFormData}
                  otpSending={otpSending}
                  usernameAvailable={usernameAvailable}
                  usernameChecking={usernameChecking}
                  validationErrors={validationErrors}
                />
              )}

              {currentStep === 2 && (
                <RegisterStepEmailVerification
                  formData={formData}
                  handleKeyPress={handleKeyPress}
                  onBack={prevStep}
                  onOtpCodeChange={setOtpCode}
                  onResend={handleResendOtp}
                  onVerify={nextStep}
                  otpCode={otpCode}
                  otpSecondsLeft={otpSecondsLeft}
                  otpSending={otpSending}
                  otpStatus={otpStatus}
                  otpVerifying={otpVerifying}
                  resendAvailableAt={resendAvailableAt}
                  validationErrors={validationErrors}
                />
              )}

              {currentStep === 3 && (
                <RegisterStepPassword
                  formData={formData}
                  handleKeyPress={handleKeyPress}
                  loading={loading}
                  onBack={prevStep}
                  onToggleConfirmPassword={() => setShowConfirmPassword((value) => !value)}
                  onTogglePassword={() => setShowPassword((value) => !value)}
                  onUpdateFormData={updateFormData}
                  showConfirmPassword={showConfirmPassword}
                  showPassword={showPassword}
                  validationErrors={validationErrors}
                />
              )}
            </AnimatePresence>
          </form>
        </Card>

        <RegisterPageLinks />
      </div>
    </div>
  );
};

export default RegisterPage;
