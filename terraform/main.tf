terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "random_pet" "suffix" {
  length    = 1
  separator = ""
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.resource_group_name}-${random_pet.suffix.id}"
  location = var.location
}
