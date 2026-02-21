import Footer from './Footer.jsx';

const PublicPageLayout = ({
  children,
  background = null,
  maxWidth = 'max-w-6xl',
  className = '',
  contentClassName = ''
}) => (
  <div className={`min-h-screen bg-gradient-dark flex flex-col ${className}`.trim()}>
    <div className="relative flex-1 overflow-hidden">
      {background ? (
        <div className="absolute inset-0 z-0">
          {background}
        </div>
      ) : null}

      <div className={`relative z-10 mx-auto w-full ${maxWidth} px-4 py-8 ${contentClassName}`.trim()}>
        {children}
      </div>
    </div>

    <Footer />
  </div>
);

export default PublicPageLayout;
