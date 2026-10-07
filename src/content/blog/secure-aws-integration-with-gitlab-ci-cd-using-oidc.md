---
title: 'Secure AWS Integration with GitLab CI/CD Using OIDC'
description: 'Enhancing security by eliminating long-lived credentials: connect GitLab CI/CD to AWS with OpenID Connect and short-lived IAM role credentials.'
pubDate: 2025-05-16
tags: ['gitlab-ci', 'cicd', 'devops', 'oidc', 'aws']
---

> Enhancing security by eliminating long-lived credentials

## Introduction

In traditional CI/CD pipelines, developers often store AWS access keys as environment variables to interact with AWS services. This practice poses significant security risks: leaked credentials can lead to unauthorized access, compliance violations, and potentially costly security incidents.

This article introduces a more secure approach: integrating GitLab CI/CD with AWS using OpenID Connect (OIDC). This method eliminates the need for long-lived access keys by leveraging short-lived, automatically rotated credentials through IAM roles and identity federation.

![GitLab OIDC Integration with AWS: the pipeline requests a token, the OIDC provider authenticates to AWS IAM, and AWS returns temporary credentials](/blog/gitlab-oidc-aws-flow.png)

## Why You Should Avoid AWS Access Keys in CI/CD Variables

Storing AWS access keys in CI/CD variables introduces several security vulnerabilities:

- **Credential Leakage Risk:** Access keys stored in CI/CD variables can be accidentally exposed in logs or through security breaches.
- **No Automatic Rotation:** Static credentials remain valid until manually revoked, increasing the attack window.
- **Limited Auditability:** It's difficult to track and audit which pipeline is using which credential.
- **Broad Permissions:** Access keys often have unnecessarily broad permissions, violating the principle of least privilege.
- **Compliance Challenges:** Many regulatory frameworks discourage or prohibit the use of long-lived credentials.

## How OIDC Authentication Works

OIDC (OpenID Connect) establishes a trust relationship between AWS and GitLab. Here's how it works:

1. GitLab CI/CD generates a short-lived JSON Web Token (JWT) for your pipeline.
2. This token is presented to AWS's Security Token Service (STS).
3. AWS validates the token against the established trust relationship.
4. If valid, AWS issues temporary credentials that your pipeline can use.
5. These credentials expire automatically after a short period.

## Implementation Guide

### Step 1: Add GitLab as an OIDC Identity Provider in AWS

1. Navigate to the AWS IAM console.
2. Select "Identity providers" and click "Add provider".
3. Choose "OpenID Connect" as the provider type.
4. Enter the following information:
   - Provider URL: `https://gitlab.com` (or your self-hosted GitLab URL)
   - Audience: `https://gitlab.com` (or your self-hosted GitLab URL)
5. Click "Add provider".

> Note: The provider URL must be publicly accessible and include the `https://` prefix without a trailing slash.

### Step 2: Create an IAM Role with Trust Relationship

1. In the AWS IAM console, navigate to "Roles" and click "Create role".
2. Select "Web identity" as the trusted entity type.
3. Choose the GitLab identity provider you created from the dropdown.
4. Set the audience to match your GitLab instance.
5. Add conditions to restrict access based on your needs.

Here's an example trust policy that limits access to specific projects and branches:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::123456789012:oidc-provider/gitlab.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringLike": {
                    "gitlab.com:sub": "project_path:my-organization/my-project/*:ref_type:branch:ref:*"
                }
            }
        }
    ]
}
```

6. Name your role (e.g., `gitlab-ci-role`) and add a description.
7. Attach policies that grant only the necessary permissions for your CI/CD pipeline.

### Step 3: Configure GitLab CI/CD to Use OIDC Authentication

Add the following configuration to your `.gitlab-ci.yml` file:

```yaml
image: registry.gitlab.com/gitlab-org/cloud-deploy/aws-base:latest

variables:
  AWS_ROLE_ARN: "arn:aws:iam::123456789012:role/gitlab-ci-role"
  AWS_DEFAULT_REGION: "us-west-2"

deploy:
  id_tokens:
    GITLAB_OIDC_TOKEN:
      aud: https://gitlab.com
  script:
    - mkdir -p ~/.aws
    - echo "${GITLAB_OIDC_TOKEN}" > /tmp/web_identity_token
    - echo -e "[profile oidc]\nrole_arn=${AWS_ROLE_ARN}\nweb_identity_token_file=/tmp/web_identity_token" > ~/.aws/config
    - export AWS_PROFILE=oidc
    - aws sts get-caller-identity
    - aws s3 ls  # Example AWS command
```

### Step 4: Validate the Integration

1. Commit your changes and push to GitLab.
2. Monitor the pipeline to ensure it completes successfully.
3. Check the job logs to verify that the AWS commands executed properly.
4. Validate in AWS CloudTrail that the actions are attributed to the correct role.

## Use Cases and Benefits

**Infrastructure as Code Deployment:** Use OIDC authentication to securely deploy infrastructure via Terraform or CloudFormation without storing access keys.

**Automated Testing with AWS Resources:** Run integration tests against real AWS resources with temporary, limited-scope credentials.

**Application Deployment to AWS Services:** Deploy applications to ECS, EKS, Lambda, or other AWS services without credential management overhead.

## Best Practices

- **Apply Least Privilege:** Grant only the specific permissions needed for your CI/CD tasks.
- **Add Conditions:** Use condition keys in your trust policies to limit which repositories or branches can assume the role.
- **Enable CloudTrail:** Ensure AWS API activity is logged and monitored.
- **Implement Approval Gates:** For production deployments, add manual approval steps.
- **Regularly Audit Roles:** Review and prune unused roles and permissions.
- **Use Different Roles:** Create separate roles for different environments (dev, staging, production).

## Conclusion

Implementing OIDC authentication between GitLab CI/CD and AWS significantly enhances your security posture by eliminating long-lived credentials from your CI/CD pipelines. This approach offers improved security, better compliance, easier auditing, and simplified credential management.

As security threats continue to evolve, moving away from static access keys to dynamic, short-lived credentials is becoming an essential best practice for cloud security. The OIDC integration between GitLab and AWS provides a robust solution that balances security requirements with operational efficiency.
