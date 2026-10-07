export interface SkillGroup {
  label: string;
  items: string[];
}

// Derived from the technologies named in the experience section; edit to taste.
export const skills: SkillGroup[] = [
  {
    label: 'Cloud',
    items: ['AWS (EKS, ECS)', 'Azure Kubernetes Service'],
  },
  {
    label: 'Infrastructure as Code',
    items: ['Terraform', 'CloudFormation', 'Crossplane', 'Ansible'],
  },
  {
    label: 'Containers & Orchestration',
    items: ['Docker', 'Kubernetes', 'Helm', 'ArgoCD (GitOps)'],
  },
  {
    label: 'CI/CD',
    items: ['Jenkins (Groovy DSL)', 'Blue/Green and Canary deployments', 'SonarQube', 'Nexus'],
  },
  {
    label: 'Observability',
    items: ['Prometheus', 'Grafana', 'CloudWatch', 'ELK', 'PagerDuty'],
  },
];
