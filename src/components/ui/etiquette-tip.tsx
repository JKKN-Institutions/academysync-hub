import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Users, Clock, Target, Heart, MessageCircle } from 'lucide-react';

type EtiquetteTipType = 'respect-time' | 'set-expectations' | 'professional' | 'goal-setting' | 'supportive' | 'communication';

interface EtiquetteTipProps {
  type: EtiquetteTipType;
  className?: string;
}

const tips = {
  'respect-time': {
    icon: Clock,
    message: "Respect each other's time by being punctual and prepared. Start and end sessions on schedule."
  },
  'set-expectations': {
    icon: Target,
    message: "Set clear expectations at the beginning. Define meeting norms, goals, and how you'll work together."
  },
  'professional': {
    icon: Users,
    message: "Maintain professional boundaries while building trust. Keep discussions constructive and confidential."
  },
  'goal-setting': {
    icon: Target,
    message: "Use SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) for better tracking and outcomes."
  },
  'supportive': {
    icon: Heart,
    message: "Be a champion for your mentee's growth. Provide honest feedback with empathy and encouragement."
  },
  'communication': {
    icon: MessageCircle,
    message: "Foster open dialogue. Ask questions, listen actively, and create a safe space for sharing challenges."
  }
};

export const EtiquetteTip: React.FC<EtiquetteTipProps> = ({ type, className = "" }) => {
  const tip = tips[type];
  const Icon = tip.icon;
  
  return (
    <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 ${className}`}>
      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <strong>Mentoring Tip:</strong> {tip.message}
      </AlertDescription>
    </Alert>
  );
};

interface MentoringStageProps {
  stage: 1 | 2 | 3 | 4;
  className?: string;
}

const stages = {
  1: {
    title: "Build Relationship",
    description: "Focus on getting to know each other, building trust, and establishing rapport."
  },
  2: {
    title: "Exchange Information & Set Goals", 
    description: "Share experiences, assess needs, and collaboratively set meaningful goals."
  },
  3: {
    title: "Work Toward Goals",
    description: "Take action, provide support, and make regular progress toward established objectives."
  },
  4: {
    title: "Closure & Planning",
    description: "Reflect on achievements, plan for the future, and transition to independence."
  }
};

export const MentoringStage: React.FC<MentoringStageProps> = ({ stage, className = "" }) => {
  const stageInfo = stages[stage];
  
  return (
    <Alert className={`border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 ${className}`}>
      <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <strong>Stage {stage}: {stageInfo.title}</strong> - {stageInfo.description}
      </AlertDescription>
    </Alert>
  );
};