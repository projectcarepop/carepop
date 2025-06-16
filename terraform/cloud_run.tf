resource "google_cloud_run_v2_service" "carepop_backend" {
  provider = google
  name     = "carepop-backend-staging"
  location = var.gcp_region

  template {
    service_account = google_service_account.cloud_run_sa.email

    containers {
      image = "gcr.io/google-containers/helloworld:latest" # Placeholder image

      ports {
        container_port = 3001
      }

      env {
        name = "SUPABASE_URL"
        value_source {
          secret_key_ref {
            secret  = "SUPABASE_URL"
            version = "latest"
          }
        }
      }

      env {
        name = "SUPABASE_ANON_KEY"
        value_source {
          secret_key_ref {
            secret  = "SUPABASE_ANON_KEY"
            version = "latest"
          }
        }
      }

      env {
        name = "SUPABASE_SERVICE_ROLE_KEY"
        value_source {
          secret_key_ref {
            secret  = "SUPABASE_SERVICE_ROLE_KEY"
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.project_services,
    google_service_account.cloud_run_sa
  ]
} 