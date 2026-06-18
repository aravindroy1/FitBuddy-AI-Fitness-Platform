resource "azurerm_servicebus_namespace" "sb" {
  name                = "sb-fitbuddy-${random_pet.suffix.id}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard"
}

resource "azurerm_servicebus_queue" "queue" {
  name         = "food-image-queue"
  namespace_id = azurerm_servicebus_namespace.sb.id
}

resource "azurerm_storage_account" "storage" {
  name                     = "stfitbuddy${random_pet.suffix.id}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "container" {
  name                  = "food-images"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "private"
}
