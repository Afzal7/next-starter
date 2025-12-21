/**
 * Centralized SaaS App Configuration
 * This file contains all configurable aspects of the application
 */

export const APP_CONFIG = {
  // App Branding
  name: "SAAS APP",
  description: "Build amazing things with our powerful platform",
  tagline: "The complete solution for modern teams",

  // Branding Assets
  logo: {
    icon: "S", // Simple letter icon
    text: "SAAS APP",
  },

  // Subscription Plans
  plans: {
    free: {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      price: {
        monthly: 0,
        annual: 0,
      },
      // features: [
      //   'Up to 3 projects',
      //   'Basic analytics',
      //   'Community support',
      //   '1 GB storage'
      // ],
      // limits: {
      //   projects: 3,
      //   storage: 1 * 1024 * 1024 * 1024, // 1GB in bytes
      //   teamMembers: 1
      // }
    },
    pro: {
      id: "pro",
      name: "Pro",
      description: "For growing teams and businesses",
      price: {
        monthly: 29,
        annual: 290,
      },
      // features: [
      //   'Unlimited projects',
      //   'Advanced analytics',
      //   'Priority support',
      //   '100 GB storage',
      //   'Team collaboration',
      //   'API access',
      //   'Custom integrations'
      // ],
      // limits: {
      //   projects: -1, // unlimited
      //   storage: 100 * 1024 * 1024 * 1024, // 100GB in bytes
      //   teamMembers: 10
      // },
      trial: {
        days: 14,
        enabled: true,
      },
    },
  },

  // Trial Configuration
  trial: {
    defaultDays: 14,
    maxExtensions: 1,
    extensionDays: 7,
  },

  // Feature Flags
  features: {
    organizations: true,
    invitations: true,
    billing: true,
    analytics: true,
    api: true,
  },

  // UI Configuration
  ui: {
    theme: {
      primary: "blue",
      accent: "purple",
    },
    animations: {
      enabled: true,
      duration: 200,
    },
  },

  // Limits
  limits: {
    maxProjectsPerUser: 100,
    maxTeamMembers: 50,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxStoragePerUser: 5 * 1024 * 1024 * 1024, // 5GB
  },

  // Support
  support: {
    email: "support@saasapp.com",
    docs: "https://docs.saasapp.com",
    community: "https://community.saasapp.com",
  },

  // Social Links
  social: {
    twitter: "https://twitter.com/saasapp",
    linkedin: "https://linkedin.com/company/saasapp",
    github: "https://github.com/saasapp",
  },

  // Analytics
  analytics: {
    enabled: true,
    trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
} as const;

// Type helpers
export type PlanId = keyof typeof APP_CONFIG.plans;
export type Plan = typeof APP_CONFIG.plans.free | typeof APP_CONFIG.plans.pro;

// Helper functions
export const getPlan = (planId: PlanId): Plan => {
  return APP_CONFIG.plans[planId];
};

export const getAllPlans = () => {
  return Object.values(APP_CONFIG.plans);
};

export const isProPlan = (planId: PlanId): boolean => {
  return planId === "pro";
};

// export const getPlanLimits = (planId: PlanId) => {
//   return APP_CONFIG.plans[planId].limits;
// };

// export const canCreateProject = (
//   planId: PlanId,
//   currentProjects: number
// ): boolean => {
//   const limits = getPlanLimits(planId);
//   return limits.projects === -1 || currentProjects < limits.projects;
// };

// export const canInviteMembers = (
//   planId: PlanId,
//   currentMembers: number
// ): boolean => {
//   const limits = getPlanLimits(planId);
//   return currentMembers < limits.teamMembers;
// };
