terraform {
  required_version = ">= 1.0"
  backend "gcs" {
    bucket  = "carepop-database-tfstate" # <-- IMPORTANT: You confirmed this is correct
    prefix  = "terraform/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
} 