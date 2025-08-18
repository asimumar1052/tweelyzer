import { useNavigate } from 'react-router-dom';
import { XIcon } from './icons/XIcon';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
              <XIcon className="w-6 h-6 text-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tweelyzer</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Tweet Analysis with Fact-Checking</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}