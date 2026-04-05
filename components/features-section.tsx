'use client';

import {
  Search,
  Zap,
  GitBranch,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'AI-Powered Triage',
    description: 'Automatically categorize and prioritize issues with machine learning. Get AI-suggested fixes and smart recommendations.',
  },
  {
    icon: GitBranch,
    title: 'Kanban Workflows',
    description: 'Visualize your workflow with drag-and-drop kanban boards. Track progress from backlog to done with ease.',
  },
  {
    icon: Zap,
    title: 'Real-Time Collaboration',
    description: 'Comment, mention teammates, and get instant notifications. Stay synchronized across distributed teams.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track velocity, cycle time, and team metrics. Data-driven insights for continuous improvement.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-card border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features for Every Team</h2>
          <p className="text-lg text-muted-foreground">Everything you need to manage issues efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
