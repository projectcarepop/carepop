# Creates the Artifact Registry repository for storing Docker images
resource "google_artifact_registry_repository" "main_repo" {
  provider      = google
  location      = var.gcp_region
  repository_id = "carepop-main-repo"
  description   = "Main repository for CarePoP application containers"
  format        = "DOCKER"

  depends_on = [
    google_project_service.project_services
  ]
} 