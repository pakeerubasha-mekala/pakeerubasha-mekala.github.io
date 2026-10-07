/** A project within one employer (use when you did several engagements at the same company). */
export interface ProjectExperience {
  /** Optional project name; the location is shown when omitted. */
  name?: string;
  period: string;
  location?: string;
  bullets: string[];
  tech: string[];
}

export interface Experience {
  role: string;
  company: string;
  /** Overall period at the company. */
  period: string;
  location?: string;
  bullets: string[];
  tech: string[];
  /** Optional per-project breakdown, most recent first. */
  projects?: ProjectExperience[];
}

export const experience: Experience[] = [
  {
    role: 'Senior DevOps Consultant',
    company: 'Equal Experts',
    period: 'Mar 2025 - Present',
    location: 'Bengaluru, Karnataka, India · Hybrid',
    bullets: [
      'Platform and infrastructure work for an HR SaaS platform, across AWS and GCP.',
    ],
    tech: [
      'AWS',
      'GCP',
      'Terraform',
      'Kubernetes',
      'Helm',
      'ArgoCD',
      'Docker',
      'GitHub Actions',
      'Octopus Deploy',
    ],
  },
  {
    role: 'DevOps Engineer',
    company: 'Tata Consultancy Services',
    period: 'Nov 2016 - Feb 2025',
    bullets: [],
    tech: [],
    projects: [
      {
        name: 'Waitrose',
        period: 'Feb 2021 - Feb 2025',
        location: 'Bracknell, England, United Kingdom',
        bullets: [
          'Led initiatives to migrate legacy infrastructure to the cloud, developing a self-service portal for resource provisioning and de-provisioning, ensuring automation and resilience.',
          'Managed, provisioned and configured cloud platforms and services primarily in AWS for various business units, especially in E-commerce.',
          'Oversaw day-to-day operations in AWS including deploying and maintaining applications, infrastructure, user management and access control, and log aggregation using Elastic Stack (ELK) for performance monitoring.',
          'Instrumented over 150+ microservices and developed automated monitoring solutions using tools like CloudWatch, Grafana, Prometheus, Grafana On-Call, and PagerDuty for on-call integration.',
          'Managed highly available EKS Kubernetes clusters, ensuring security, efficient release management and seamless microservice deployments using Helm.',
          'Leveraged Infrastructure as Code (IaC) with CloudFormation, Terraform, and Crossplane for cloud infrastructure provisioning, complemented by Configuration as Code (CaC) with Ansible. Developed and maintained custom Ansible modules and plugins for streamlined configuration management.',
          'Implemented GitOps methodology utilizing ArgoCD for declarative and automated Kubernetes deployments, ensuring efficient and version-controlled infrastructure management.',
          'Implemented Crossplane for provisioning Grafana and AWS resources, streamlining resource management across clouds and tools.',
          'Designed, built and maintained CI/CD pipelines (using Groovy DSL) with capabilities for Blue/Green/Canary deployments and integrating quality checks early in the code pipeline.',
          'Managed DevOps tools lifecycle including Jenkins, Nexus, SonarQube, Contrast, Keycloak, Elastic Stack, etc.',
          'Developed cost optimization metrics to monitor and optimize total cloud resource spending, ensuring cost-effective resource allocation.',
          'Proficient in container-based deployments using Docker, managing Docker images, and working with registries.',
        ],
        tech: [
          'AWS',
          'EKS',
          'Kubernetes',
          'Helm',
          'ArgoCD',
          'Terraform',
          'CloudFormation',
          'Crossplane',
          'Ansible',
          'Jenkins',
          'Docker',
          'Prometheus',
          'Grafana',
          'ELK',
          'PagerDuty',
        ],
      },
      {
        name: 'OmniStore',
        period: 'Nov 2016 - Jan 2021',
        location: 'Bengaluru, Karnataka, India',
        bullets: [
          'Led CI/CD process implementation using Jenkins and shell scripting to automate pipelines.',
          'Implemented zero-downtime configuration for deploying applications using AWS ECS.',
          'Deployed Kubernetes on on-prem VM servers for application deployment and managed cluster upgrades.',
          'Created Docker containers for application deployment, ensuring consistency and portability across environments.',
          'Configured Azure Kubernetes Service for deploying applications with zero downtime for clients.',
          'Implemented security tools for SAST, DAST and OSS scans, integrating them into CI/CD.',
          'Set up artifact repositories and quality testing tools for applications.',
          'Contributed to the on-call team ensuring 24/7 production system health for global availability.',
          'Provided support to global development teams, offering solutions design advice and diagnostics.',
          'Prepared technical and functional documents for knowledge transition.',
          'Prioritized problems, incidents and service requests, occasionally leading processes with the Product Owner.',
          'Identified and implemented operating efficiency solutions for product features, assisting in upgrades or patches as needed.',
          'Participated in incident management and conducted root cause analysis (RCA).',
          'Analyzed problems and implemented permanent fixes to enhance application stability.',
        ],
        tech: ['Jenkins', 'Shell', 'AWS ECS', 'Kubernetes', 'Docker', 'Azure Kubernetes Service'],
      },
    ],
  },
];
