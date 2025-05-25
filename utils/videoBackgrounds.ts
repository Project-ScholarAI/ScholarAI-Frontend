export const backgroundOptions = [
  {
    id: 'scholarai-image',
    label: 'ScholarAI Background',
    type: 'image',
    className: 'bg-cover bg-center bg-no-repeat',
    backgroundImage: '/assets/bg2.png',
  },
  {
    id: 'scholarai-gradient',
    label: 'ScholarAI Gradient',
    type: 'gradient',
    className: 'bg-gradient-to-br from-background via-background to-muted/20',
  },
  {
    id: 'neural-network',
    label: 'Neural Network',
    type: 'animated',
    className: 'bg-gradient-to-br from-primary/5 via-background to-secondary/10',
    overlay: 'neural-dots',
  },
  {
    id: 'research-flow',
    label: 'Research Flow',
    type: 'animated',
    className: 'bg-gradient-to-tr from-background via-muted/10 to-primary/5',
    overlay: 'floating-particles',
  },
  {
    id: 'academic-waves',
    label: 'Academic Waves',
    type: 'animated',
    className: 'bg-gradient-to-br from-background via-primary/3 to-muted/15',
    overlay: 'wave-pattern',
  },
  {
    id: 'knowledge-grid',
    label: 'Knowledge Grid',
    type: 'pattern',
    className: 'bg-gradient-to-br from-background to-muted/10',
    overlay: 'grid-pattern',
  },
];

// Default background for login page
export const defaultBackground = backgroundOptions[0];

// CSS animations and patterns
export const backgroundStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }

  @keyframes drift {
    0% { transform: translateX(-100px) translateY(0px); }
    100% { transform: translateX(calc(100vw + 100px)) translateY(-50px); }
  }

  @keyframes wave {
    0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
    25% { transform: translateX(5px) translateY(-5px) rotate(1deg); }
    50% { transform: translateX(-5px) translateY(-10px) rotate(-1deg); }
    75% { transform: translateX(-5px) translateY(-5px) rotate(0.5deg); }
  }

  .neural-dots::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.1) 1px, transparent 1px),
      radial-gradient(circle at 80% 40%, hsl(var(--primary) / 0.08) 1px, transparent 1px),
      radial-gradient(circle at 40% 80%, hsl(var(--primary) / 0.06) 1px, transparent 1px),
      radial-gradient(circle at 90% 10%, hsl(var(--primary) / 0.04) 1px, transparent 1px),
      radial-gradient(circle at 10% 90%, hsl(var(--primary) / 0.05) 1px, transparent 1px);
    background-size: 100px 100px, 150px 150px, 200px 200px, 120px 120px, 180px 180px;
    animation: float 20s ease-in-out infinite;
  }

  .floating-particles::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, hsl(var(--primary) / 0.08) 1px, transparent 1px),
      radial-gradient(circle at 50% 10%, hsl(var(--primary) / 0.06) 1.5px, transparent 1.5px),
      radial-gradient(circle at 10% 60%, hsl(var(--primary) / 0.04) 1px, transparent 1px),
      radial-gradient(circle at 90% 30%, hsl(var(--primary) / 0.05) 1px, transparent 1px);
    background-size: 200px 200px, 300px 300px, 150px 150px, 250px 250px, 180px 180px;
    animation: drift 30s linear infinite;
  }

  .wave-pattern::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(45deg, transparent 40%, hsl(var(--primary) / 0.03) 50%, transparent 60%),
      linear-gradient(-45deg, transparent 40%, hsl(var(--primary) / 0.02) 50%, transparent 60%),
      linear-gradient(90deg, transparent 45%, hsl(var(--primary) / 0.01) 50%, transparent 55%);
    background-size: 100px 100px, 150px 150px, 200px 200px;
    animation: wave 15s ease-in-out infinite;
  }

  .grid-pattern::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(hsl(var(--border) / 0.1) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--border) / 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 70%);
  }

  .background-container {
    position: relative;
    overflow: hidden;
  }

  .background-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.1) 100%);
    pointer-events: none;
  }

  /* Image background styles */
  .image-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .image-background::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      hsl(var(--background) / 0.8) 0%,
      hsl(var(--background) / 0.6) 50%,
      hsl(var(--background) / 0.8) 100%
    );
    pointer-events: none;
  }

  /* Floating elements for enhanced visual appeal */
  .floating-element {
    position: absolute;
    border-radius: 50%;
    background: hsl(var(--primary) / 0.05);
    animation: float 20s ease-in-out infinite;
  }

  .floating-element:nth-child(1) {
    width: 60px;
    height: 60px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .floating-element:nth-child(2) {
    width: 40px;
    height: 40px;
    top: 20%;
    right: 15%;
    animation-delay: 5s;
  }

  .floating-element:nth-child(3) {
    width: 80px;
    height: 80px;
    bottom: 15%;
    left: 20%;
    animation-delay: 10s;
  }

  .floating-element:nth-child(4) {
    width: 50px;
    height: 50px;
    bottom: 25%;
    right: 10%;
    animation-delay: 15s;
  }

  /* Subtle glow effect */
  .glow-element {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%);
    animation: pulse-glow 8s ease-in-out infinite;
  }

  .glow-element:nth-child(1) {
    width: 200px;
    height: 200px;
    top: 5%;
    right: 5%;
    animation-delay: 0s;
  }

  .glow-element:nth-child(2) {
    width: 150px;
    height: 150px;
    bottom: 10%;
    left: 5%;
    animation-delay: 4s;
  }
`;
