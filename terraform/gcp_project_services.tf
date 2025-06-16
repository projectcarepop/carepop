# Enables the necessary APIs for the project
resource "google_project_service" "project_services" {
  for_each = toset([
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com"
  ])

  project                    = var.gcp_project_id
  service                    = each.key
  disable_dependent_services = true
} 