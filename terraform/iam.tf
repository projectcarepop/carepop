# Create a dedicated service account for the Cloud Run service
resource "google_service_account" "cloud_run_sa" {
  account_id   = "carepop-backend-run-sa"
  display_name = "CarePoP Backend Cloud Run SA"
}

# Grant the service account the ability to be used by Cloud Run
resource "google_project_iam_member" "run_invoker" {
  project = var.gcp_project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant the service account permission to access secrets in Secret Manager
resource "google_project_iam_member" "secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
} 