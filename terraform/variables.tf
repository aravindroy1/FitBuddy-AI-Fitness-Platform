variable "location" {
  description = "The Azure Region to deploy resources into"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
  default     = "rg-fitbuddy"
}

variable "aks_node_count" {
  description = "Number of nodes for the AKS cluster"
  type        = number
  default     = 2
}
