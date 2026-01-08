import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Card from '@/components/ui/Card.jsx';
import { useAuthOperations } from '@/hooks/useAuth.js';
import LoginPageBackground from '@/components/auth/login/LoginPageBackground.jsx';
import LoginPageHeader from '@/components/auth/login/LoginPageHeader.jsx';
import LoginPageLinks from '@/components/auth/login/LoginPageLinks.jsx';
import LoginProgressIndicator from '@/components/auth/login/LoginProgressIndicator.jsx';
import LoginStepIdentifier from '@/components/auth/login/LoginStepIdentifier.jsx';
import LoginStepPassword from '@/components/auth/login/LoginStepPassword.jsx';
import { validateLoginStep } from '@/components/auth/login/loginValidation.js';
import { playClick } from '@/utils/sound.js';
import { useLocation, useNavigate } from 'react-router-dom';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { signIn, loading, error } = useAuthOperations();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const validateStep = (step) => {
    const errors = validateLoginStep({
      identifier,
      password,
      step
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((previous) => previous + 1);
    playClick();
  };

  const prevStep = () => {
    setCurrentStep((previous) => previous - 1);
    setValidationErrors({});
    playClick();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep(2)) return;

    const result = await signIn(identifier, password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key !== 'Enter') return;
    if (currentStep === 1) {
      nextStep();
      return;
    }
    handleSubmit(event);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <LoginPageBackground />

      <div className="relative w-full max-w-md">
        <LoginPageHeader />
        <LoginProgressIndicator currentStep={currentStep} />

        <Card variant="glass" padding="lg" className="mb-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <LoginStepIdentifier
                    identifier={identifier}
                    onContinue={nextStep}
                    onIdentifierChange={setIdentifier}
                    onKeyPress={handleKeyPress}
                    validationError={validationErrors.identifier}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <LoginStepPassword
                    error={error}
                    identifier={identifier}
                    loading={loading}
                    onBack={prevStep}
                    onKeyPress={handleKeyPress}
                    onPasswordChange={setPassword}
                    onToggleShowPassword={() => setShowPassword((previous) => !previous)}
                    password={password}
                    showPassword={showPassword}
                    validationError={validationErrors.password}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>

        <LoginPageLinks />
      </div>
    </div>
  );
};

export default LoginPage;
